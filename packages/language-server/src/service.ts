import { fileURLToPath } from 'node:url'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { ProposedFeatures, TextDocumentSyncKind, TextDocuments, createConnection } from 'vscode-languageserver/node'
import type { CompletionItem, Disposable, InitializeParams, InitializeResult } from 'vscode-languageserver/node'
import { createNanoEvents } from './integration'
import { ContextLoader } from './contextLoader'
import { createLogger } from './log'
import { useConfigurations } from './configuration'
import type { LanguageContextOptions, LanguageServiceContext, LanguageServiceContextEventsMap } from './types'
import { registerAutoComplete } from './autocomplete'
import { registerAnnotation } from './annotation'

const triggerCharacters = ['-', ':', ' ', '"', '\'', '!']

export function createLanguageService(options: LanguageContextOptions = {}): LanguageServiceContext {
  const documents = new TextDocuments(TextDocument)
  const connection = options.connection ?? createConnection(ProposedFeatures.all)
  const logger = options.logger ?? createLogger(connection)

  const contextLoader = options.contextLoader ?? new ContextLoader()

  const disposables: Disposable[] = []

  const events = createNanoEvents<LanguageServiceContextEventsMap>()

  const configurationStore = useConfigurations(connection, events)

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

  disposables.push(connection.onInitialized(async () => {
    events.emit('serviceReady')
  }))

  const serviceContext: LanguageServiceContext = {
    connection,
    documents,
    contextLoader,
    logger,
    events,
    disposables,
    configuration: configurationStore.configuration,
    watchConfigChanged: configurationStore.watchChanged,
    getDocument,
    listen,
    dispose,
    use(...providers) {
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

  serviceContext.use(
    registerAutoComplete,
    registerAnnotation,
  )

  return serviceContext
}
