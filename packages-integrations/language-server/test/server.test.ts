import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { pathToFileURL } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-languageserver/node'

const transport = vi.hoisted(() => ({ reader: undefined as any, writer: undefined as any }))

vi.mock('vscode-languageserver/node', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vscode-languageserver/node')>()
  return {
    ...actual,
    createConnection: () => actual.createConnection(actual.ProposedFeatures.all, transport.reader, transport.writer),
  }
})

const cleanups: (() => Promise<void> | void)[] = []

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map(cleanup => cleanup()))
  vi.resetModules()
})

async function startServer(register: (index: number) => 'accept' | 'reject' | 'hang' = () => 'accept') {
  const root = await mkdtemp(path.join(os.tmpdir(), 'unocss-language-server-'))
  await writeFile(path.join(root, 'uno.config.mjs'), `export default { rules: [['probe', { color: 'red' }], ['zorblet', { color: 'blue' }]] }\n`)
  const toServer = new PassThrough()
  const toClient = new PassThrough()
  transport.reader = new StreamMessageReader(toServer)
  transport.writer = new StreamMessageWriter(toClient)
  await import('../src/server')

  const client = createMessageConnection(new StreamMessageReader(toClient), new StreamMessageWriter(toServer))
  const watchers = { total: 0, rejected: 0, active: new Set<string>(), unregistered: new Set<string>() }
  const pending: (() => void)[] = []
  client.onRequest('workspace/configuration', () => [{}])
  client.onRequest('client/registerCapability', async ({ registrations }: { registrations: { id: string }[] }) => {
    watchers.total++
    const action = register(watchers.total)
    if (action === 'hang')
      return await new Promise<void>(done => pending.push(done))
    if (action === 'reject') {
      watchers.rejected++
      throw new Error('registration rejected')
    }
    for (const { id } of registrations)
      watchers.active.add(id)
  })
  client.onRequest('client/unregisterCapability', ({ unregisterations }: { unregisterations: { id: string }[] }) => {
    for (const { id } of unregisterations) {
      watchers.active.delete(id)
      watchers.unregistered.add(id)
    }
  })
  client.listen()
  cleanups.push(async () => {
    pending.splice(0).forEach(done => done())
    await vi.waitFor(() => {
      expect(watchers.active.size + watchers.unregistered.size + watchers.rejected).toBe(watchers.total)
      expect(watchers.active.size).toBeLessThanOrEqual(1)
    }, { timeout: 5000 })
    client.dispose()
    toServer.end()
    toClient.end()
    await rm(root, { recursive: true, force: true })
  })

  const rootUri = pathToFileURL(root).href
  await client.sendRequest('initialize', {
    processId: null,
    rootUri,
    workspaceFolders: [{ uri: rootUri, name: 'test' }],
    capabilities: { workspace: { didChangeWatchedFiles: { dynamicRegistration: true } } },
  })
  await client.sendNotification('initialized', {})
  await vi.waitFor(() => expect(watchers.total).toBeGreaterThan(0), { timeout: 10_000 })

  return { client, root, watchers }
}

it('recomputes matched positions after settings change', async () => {
  const { client, root } = await startServer()
  const uri = pathToFileURL(path.join(root, 'view.tsx')).href
  const text = 'const probe = 1\nexport const view = <div className="probe" />\n'
  await client.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'typescriptreact', version: 1, text } })
  const positions = async () => (await client.sendRequest<{ positions: unknown[] }>('unocss/getMatchedPositions', { uri })).positions.length

  await vi.waitFor(async () => expect(await positions()).toBe(2), { timeout: 10_000 })
  await client.sendNotification('workspace/didChangeConfiguration', { settings: { unocss: { strictAnnotationMatch: true } } })

  await vi.waitFor(async () => expect(await positions()).toBe(1), { timeout: 5000 })
})

it('keeps one config watcher registration when settings change twice', async () => {
  const { client, watchers } = await startServer()
  const settings = { settings: { unocss: { strictAnnotationMatch: true } } }

  await client.sendNotification('workspace/didChangeConfiguration', settings)
  await client.sendNotification('workspace/didChangeConfiguration', settings)

  await vi.waitFor(() => {
    expect(watchers.total).toBe(3)
    expect(watchers.active.size).toBe(1)
  }, { timeout: 5000 })
})

async function openDocument(client: Awaited<ReturnType<typeof startServer>>['client'], root: string, text: string) {
  const uri = pathToFileURL(path.join(root, 'view.tsx')).href
  await client.sendNotification('textDocument/didOpen', { textDocument: { uri, languageId: 'typescriptreact', version: 1, text } })
  return uri
}

async function fuzzyLabels(client: Awaited<ReturnType<typeof startServer>>['client'], uri: string, character: number) {
  const result = await client.sendRequest<{ items: { label: string }[] } | null>('textDocument/completion', { textDocument: { uri }, position: { line: 0, character } })
  return result?.items.map(item => item.label) ?? []
}

it('keeps strict positions after a references request', async () => {
  const { client, root, watchers } = await startServer()
  const text = 'const probe = 1\nexport const view = <div className="probe" />\n'
  const uri = await openDocument(client, root, text)
  await client.sendNotification('workspace/didChangeConfiguration', { settings: { unocss: { strictAnnotationMatch: true } } })
  await vi.waitFor(() => expect(watchers.total).toBe(2), { timeout: 5000 })

  await client.sendRequest('textDocument/references', { textDocument: { uri }, position: { line: 1, character: text.split('\n')[1].indexOf('probe') + 1 }, context: { includeDeclaration: true } })

  expect((await client.sendRequest<{ positions: unknown[] }>('unocss/getMatchedPositions', { uri })).positions).toHaveLength(1)
})

it('applies later settings while a watcher registration is unanswered', async () => {
  const { client, root, watchers } = await startServer(index => index === 2 ? 'hang' : 'accept')
  const text = 'export const view = <div className="zrbt" />\n'
  const uri = await openDocument(client, root, text)

  await client.sendNotification('workspace/didChangeConfiguration', { settings: { unocss: { strictAnnotationMatch: true } } })
  await vi.waitFor(() => expect(watchers.total).toBe(2), { timeout: 5000 })
  await client.sendNotification('workspace/didChangeConfiguration', { settings: { unocss: { autocomplete: { matchType: 'fuzzy' } } } })

  await vi.waitFor(async () => {
    expect(watchers.total).toBe(3)
    expect(watchers.active.size).toBe(1)
    expect(await fuzzyLabels(client, uri, text.indexOf('zrbt"') + 4)).toContain('zorblet')
  }, { timeout: 5000 })
})

it('applies settings and keeps a watcher when a registration is rejected', async () => {
  const { client, root, watchers } = await startServer(index => index === 2 ? 'reject' : 'accept')
  const text = 'export const view = <div className="zrbt" />\n'
  const uri = await openDocument(client, root, text)
  await vi.waitFor(async () => expect(await fuzzyLabels(client, uri, text.indexOf('zrbt"') + 4)).not.toContain('zorblet'), { timeout: 10_000 })

  await client.sendNotification('workspace/didChangeConfiguration', { settings: { unocss: { autocomplete: { matchType: 'fuzzy' } } } })

  await vi.waitFor(async () => {
    expect(watchers.total).toBe(2)
    expect(watchers.active.size).toBe(1)
    expect(await fuzzyLabels(client, uri, text.indexOf('zrbt"') + 4)).toContain('zorblet')
  }, { timeout: 5000 })
})
