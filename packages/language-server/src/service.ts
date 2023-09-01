import { fileURLToPath } from 'node:url'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { DidChangeConfigurationNotification, ProposedFeatures, TextDocumentSyncKind, TextDocuments, createConnection } from 'vscode-languageserver/node'
import type { CompletionItem, Disposable, InitializeParams, InitializeResult } from 'vscode-languageserver/node'
import { ContextLoader } from './contextLoader'
import { createLogger } from './log'
import { useConfigurations } from './configuration'
import type { LanguageContextOptions, LanguageServiceContext, LanguageServiceProvider } from './types'
import { registerAutoComplete } from './autocomplete'
import { registerAnnotation } from './annotation'

const triggerCharacters = ['-', ':', ' ', '"', '\'', '!']

export function createLanguageService(options: LanguageContextOptions = {}): LanguageServiceContext {
  const documents = new TextDocuments(TextDocument)
  const connection = options.connection ?? createConnection(ProposedFeatures.all)
  const contextLoader = options.contextLoader ?? new ContextLoader()
  const logger = options.logger ?? createLogger(connection)

  const disposables: Disposable[] = []

  const configurationStore = useConfigurations(connection)

  disposables.push(configurationStore)

  connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
      return item
    },
  )

  const listen = () => {
    documents.listen(connection)
    connection.listen()
  }

  const dispose = () => {
    disposables.forEach(d => d.dispose())
  }

  const getDocument = (uri: string) => {
    return documents.get(uri) ?? null
  }

  const serviceContext: LanguageServiceContext = {
    connection,
    documents,
    contextLoader,
    logger,
    disposables,
    configuration: configurationStore.configuration,
    configReady: configurationStore.ready,
    watchConfigChanged: configurationStore.watchChanged,
    getDocument,
    listen,
    dispose,
    use(...providers: LanguageServiceProvider[]) {
      providers.forEach(p => p(serviceContext))
    },
  }

  disposables.push(connection.onInitialize(async (params: InitializeParams) => {
    contextLoader.setWorkspaceFolders(params.workspaceFolders?.map(f => fileURLToPath(f.uri)) ?? [])
    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters,
        },
      },
    }

    return result
  }))

  disposables.push(connection.onInitialized(async () => {
    connection.client.register(DidChangeConfigurationNotification.type)
    await configurationStore.reload()
    await contextLoader.reload()
  }))

  configurationStore.ready.then(() => {
    serviceContext.use(
      registerAutoComplete,
      registerAnnotation,
    )
  })

  return serviceContext
}
