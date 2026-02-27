import type { ExtensionContext } from 'vscode'
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'
import path from 'node:path'
import process from 'node:process'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'
import { getLanguageIds } from './configs'
import { log } from './log'

let client: LanguageClient | undefined

export async function createLanguageClient(
  context: ExtensionContext,
): Promise<LanguageClient> {
  const serverModule = context.asAbsolutePath(
    path.join('dist', 'server.cjs'),
  )

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: {
        env: {
          ...process.env,
          // https://github.com/unocss/unocss/pull/5107 introduces ANSI color outputs which not render well in VS Code's output channel. Setting `NO_COLOR` to disable it.
          NO_COLOR: '1',
        },
      },
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  }

  const languageIds = await getLanguageIds()

  const clientOptions: LanguageClientOptions = {
    documentSelector: languageIds.map(id => ({
      language: id,
      scheme: 'file',
    })),
    synchronize: {
      configurationSection: 'unocss',
    },
    outputChannel: log.channel,
  }

  client = new LanguageClient(
    'unocss',
    'UnoCSS Language Server',
    serverOptions,
    clientOptions,
  )

  return client
}

export function getClient(): LanguageClient | undefined {
  return client
}

export async function stopClient(): Promise<void> {
  if (client) {
    await client.stop()
    client = undefined
  }
}
