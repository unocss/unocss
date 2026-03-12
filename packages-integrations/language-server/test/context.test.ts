import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { ContextManager } from '../src/index'

function noop() {}

const connection = {
  console: {
    log: noop,
    warn: noop,
  },
} as any

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

async function createTempWorkspace() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'unocss-language-server-'))
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
