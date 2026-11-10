import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { ContextManager } from '../src/index'

const heldReaddir = vi.hoisted(() => ({ dir: '', started: false, release: () => {} }))

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    readdir: (async (dir: string, ...rest: unknown[]) => {
      if (heldReaddir.dir && dir === heldReaddir.dir && !heldReaddir.started) {
        heldReaddir.started = true
        await new Promise<void>(done => heldReaddir.release = done)
      }
      return (actual.readdir as (...args: unknown[]) => unknown)(dir, ...rest)
    }) as typeof actual.readdir,
  }
})

function noop() {}

const connection = {
  console: {
    log: noop,
    warn: noop,
  },
} as any

const tempDirs: string[] = []

afterEach(async () => {
  heldReaddir.dir = ''
  heldReaddir.started = false
  heldReaddir.release()
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

async function createTempWorkspace() {
  const tempDir = await realpath(await mkdtemp(path.join(os.tmpdir(), 'unocss-language-server-')))
  tempDirs.push(tempDir)
  return tempDir
}

async function writeSourceFile(filePath: string, sourceCode = '<div className="text-red-500" />\n') {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, sourceCode)
  return sourceCode
}

it('loads configured roots outside the default workspace root', async () => {
  const tempDir = await createTempWorkspace()

  const workspaceRoot = path.join(tempDir, 'workspace-a')
  const configuredRoot = path.join(tempDir, 'workspace-b')
  const sourceFile = path.join(configuredRoot, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)

  await mkdir(workspaceRoot, { recursive: true })
  await writeFile(path.join(configuredRoot, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(workspaceRoot, connection)
  await manager.ready

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeUndefined()

  await manager.setRoots([configuredRoot])

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeTruthy()
  expect(manager.isTarget(sourceFile)).toBe(true)
})

it('discovers nested config within a configured root set after initialization', async () => {
  const tempDir = await createTempWorkspace()

  const workspaceRoot = path.join(tempDir, 'workspace-a')
  const configuredRoot = path.join(tempDir, 'workspace-b')
  // Config is nested inside configuredRoot, not at the root itself
  const configDir = path.join(configuredRoot, 'packages', 'app')
  const sourceFile = path.join(configDir, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)

  await mkdir(workspaceRoot, { recursive: true })
  await writeFile(path.join(configDir, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(workspaceRoot, connection)
  await manager.ready

  await manager.setRoots([configuredRoot])

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeTruthy()
})

it('discovers nested config inside a secondary workspace folder by default', async () => {
  const tempDir = await createTempWorkspace()

  const workspaceA = path.join(tempDir, 'workspace-a')
  const workspaceB = path.join(tempDir, 'workspace-b')
  const configDir = path.join(workspaceB, 'packages', 'app')
  const sourceFile = path.join(configDir, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)

  await mkdir(workspaceA, { recursive: true })
  await writeFile(path.join(configDir, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(workspaceA, connection, [workspaceA, workspaceB])
  await manager.ready

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeTruthy()
})

async function writeGatedConfig(dir: string, gate: string, file = 'uno.config.mjs') {
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, file), `globalThis.${gate}Started = true\nawait globalThis.${gate}\nexport default {}\n`)
}

function createGate(name: string) {
  const globals = globalThis as Record<string, unknown>
  let release!: () => void
  globals[name] = new Promise<void>(done => release = done)
  return {
    started: () => globals[`${name}Started`] === true,
    release,
    dispose() {
      delete globals[name]
      delete globals[`${name}Started`]
    },
  }
}

it('does not discover config outside the configured roots', async () => {
  const tempDir = await createTempWorkspace()
  const kept = path.join(tempDir, 'kept')
  const removed = path.join(tempDir, 'removed')
  const sourceFile = path.join(removed, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  await mkdir(kept, { recursive: true })
  await writeFile(path.join(kept, 'uno.config.mjs'), 'export default {}\n')
  await writeFile(path.join(removed, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(tempDir, connection)
  await manager.ready
  await manager.setRoots([kept])

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeUndefined()
  expect(Array.from(manager.contextsMap.keys())).toEqual([kept])
})

it('drops a root load that a newer root change replaced', async () => {
  const tempDir = await createTempWorkspace()
  const slow = path.join(tempDir, 'slow')
  const fast = path.join(tempDir, 'fast')
  const sourceFile = path.join(slow, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  const gate = createGate('__unoRootGateA')
  await writeGatedConfig(slow, '__unoRootGateA')
  await mkdir(fast, { recursive: true })
  await writeFile(path.join(fast, 'uno.config.mjs'), 'export default {}\n')

  try {
    const manager = new ContextManager(fast, connection)
    await manager.ready

    const first = manager.setRoots([slow])
    await vi.waitFor(() => expect(gate.started()).toBe(true), { timeout: 10_000 })
    await manager.setRoots([fast])
    gate.release()
    await first

    expect(Array.from(manager.contextsMap.keys())).toEqual([fast])
    await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeUndefined()
  }
  finally {
    gate.release()
    gate.dispose()
  }
})

it('drops a reload of a root that a root change removed', async () => {
  const tempDir = await createTempWorkspace()
  const slow = path.join(tempDir, 'slow')
  const fast = path.join(tempDir, 'fast')
  const sourceFile = path.join(slow, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  await writeFile(path.join(slow, 'uno.config.ts'), 'export default {}\n')
  await mkdir(fast, { recursive: true })
  await writeFile(path.join(fast, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(slow, connection)
  await manager.ready

  const gate = createGate('__unoRootGateB')
  await writeGatedConfig(slow, '__unoRootGateB', 'uno.config.ts')
  try {
    const reload = manager.reload()
    await vi.waitFor(() => expect(gate.started()).toBe(true), { timeout: 10_000 })
    await manager.setRoots([fast])
    gate.release()
    await reload

    expect(Array.from(manager.contextsMap.keys())).toEqual([fast])
    await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeUndefined()
  }
  finally {
    gate.release()
    gate.dispose()
  }
})

it('does not load a removed root again after a root change during its load', async () => {
  const tempDir = await createTempWorkspace()
  const kept = path.join(tempDir, 'kept')
  const removed = path.join(tempDir, 'removed')
  const sourceFile = path.join(removed, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  await mkdir(kept, { recursive: true })
  await writeFile(path.join(kept, 'uno.config.ts'), 'export default {}\n')
  await writeFile(path.join(removed, 'uno.config.ts'), `globalThis.__unoRootRuns = (globalThis.__unoRootRuns ?? 0) + 1
if (!globalThis.__unoRootOpen) await globalThis.__unoRootGateC
export default {}\n`)
  const globals = globalThis as { __unoRootRuns?: number, __unoRootOpen?: boolean, __unoRootGateC?: Promise<void> }
  let open!: () => void
  globals.__unoRootGateC = new Promise<void>(done => open = done)

  try {
    const manager = new ContextManager(kept, connection, [kept, removed])
    await vi.waitFor(() => expect(manager.contextsMap.has(kept) && (globals.__unoRootRuns ?? 0) > 0).toBe(true), { timeout: 10_000 })
    const pending = manager.resolveClosestContext(sourceCode, sourceFile)
    await manager.setRoots([kept])
    globals.__unoRootOpen = true
    open()
    await manager.ready
    await pending
    const runs = globals.__unoRootRuns

    for (let i = 0; i < 3; i++)
      await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeUndefined()
    expect(globals.__unoRootRuns).toBe(runs)
  }
  finally {
    open()
    delete globals.__unoRootRuns
    delete globals.__unoRootOpen
    delete globals.__unoRootGateC
  }
})

it('discovers a nested config after roots widen during a config search', async () => {
  const tempDir = await createTempWorkspace()
  const pkg = path.join(tempDir, 'pkg')
  const nested = path.join(pkg, 'src', 'components')
  const sourceFile = path.join(nested, 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  await writeFile(path.join(pkg, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(path.join(pkg, 'src'), connection)
  await manager.ready
  heldReaddir.dir = nested
  const pending = manager.resolveClosestContext(sourceCode, sourceFile)
  await vi.waitFor(() => expect(heldReaddir.started).toBe(true), { timeout: 5000 })
  await manager.setRoots([tempDir])
  heldReaddir.release()
  await pending

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeTruthy()
})

it('matches a root written through a symlink', async () => {
  const tempDir = await createTempWorkspace()
  const real = path.join(tempDir, 'real')
  const link = path.join(tempDir, 'link')
  const sourceFile = path.join(real, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  await writeFile(path.join(real, 'uno.config.mjs'), 'export default {}\n')
  await symlink(real, link)

  const manager = new ContextManager(real, connection)
  await manager.ready
  await manager.setRoots([link])

  expect(manager.isTarget(sourceFile)).toBe(true)
  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeTruthy()
})

it('matches a root with a trailing separator', async () => {
  const tempDir = await createTempWorkspace()
  const root = path.join(tempDir, 'ws')
  const sourceFile = path.join(root, 'src', 'App.tsx')
  const sourceCode = await writeSourceFile(sourceFile)
  await writeFile(path.join(root, 'uno.config.mjs'), 'export default {}\n')

  const manager = new ContextManager(tempDir, connection)
  await manager.ready
  await manager.setRoots([`${root}${path.sep}`])

  await expect(manager.resolveClosestContext(sourceCode, sourceFile)).resolves.toBeTruthy()
})
