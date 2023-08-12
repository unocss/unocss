import { LanguageClient, TransportKind } from 'vscode-languageclient/node'
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'
import type { ExtensionContext } from 'vscode'
import { version } from '../package.json'
import { log } from './log'
import { createAnnotationHandler } from './annotations'

let client: LanguageClient

export async function activate(ext: ExtensionContext) {
  log.appendLine(`⚪️ UnoCSS for VS Code v${version}\n`)

  const serverModule = ext.asAbsolutePath('dist/server.js')

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'css' },
      { scheme: 'file', language: 'postcss' },
      { scheme: 'file', language: 'html' },
      { scheme: 'file', language: 'vue' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'javascriptreact' },
    ],
    outputChannel: log,
  }

  client = new LanguageClient('unocss-lsp', 'UnoCSS LanguageClient', serverOptions, clientOptions)

  client.onNotification('unocss/annotation', createAnnotationHandler())

  client.registerProposedFeatures()
  client.start()
}

export function deactivate() {
  if (client)
    client.stop()
}
