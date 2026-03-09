import type { ExtensionContext, OutputChannel } from 'vscode'
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'
import path from 'node:path'
import process from 'node:process'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'
import { getLanguageIds } from './configs'
import { log } from './log'

let client: LanguageClient | undefined

function patchOutputChannel(): OutputChannel {
  return {
    ...log.channel,
    appendLine(value: string): void {
      // vscode-languageclient prepends "[Level - timestamp] " to every line.
      // Strip it so LogOutputChannel doesn't double-prefix the message.
      const prefixEnd = value.startsWith('[') ? value.indexOf('] ') : -1
      const message = prefixEnd >= 0 ? value.slice(prefixEnd + 2) : value
      if (value.startsWith('[Error'))
        log.error(message)
      else if (value.startsWith('[Warn '))
        log.warn(message)
      else
        log.info(message)
    },
  }
}

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
    /**
     * use `log.channel` instead if we bump vscode-languageclient to v10
     * @see https://github.com/microsoft/vscode-languageserver-node/pull/1630
     */
    outputChannel: patchOutputChannel(),
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
