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

async function startServer() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'unocss-language-server-'))
  await writeFile(path.join(root, 'uno.config.mjs'), `export default { rules: [['probe', { color: 'red' }]] }\n`)
  const toServer = new PassThrough()
  const toClient = new PassThrough()
  transport.reader = new StreamMessageReader(toServer)
  transport.writer = new StreamMessageWriter(toClient)
  await import('../src/server')

  const client = createMessageConnection(new StreamMessageReader(toClient), new StreamMessageWriter(toServer))
  const watchers = { total: 0, active: new Set<string>() }
  client.onRequest('workspace/configuration', () => [{}])
  client.onRequest('client/registerCapability', ({ registrations }: { registrations: { id: string }[] }) => {
    for (const { id } of registrations) {
      watchers.total++
      watchers.active.add(id)
    }
  })
  client.onRequest('client/unregisterCapability', ({ unregisterations }: { unregisterations: { id: string }[] }) => {
    for (const { id } of unregisterations)
      watchers.active.delete(id)
  })
  client.listen()
  cleanups.push(async () => {
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
