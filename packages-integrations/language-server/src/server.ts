import type { ServerSettings } from './types'
import { fileURLToPath } from 'node:url'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { TextDocument } from 'vscode-languageserver-textdocument'
import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node'
import { registerColorProvider } from './capabilities/colorProvider'
import { registerCompletion, resetAutoCompleteCache } from './capabilities/completion'
import { registerHover } from './capabilities/hover'
import { registerReferences } from './capabilities/references'
import { clearAllCache, clearDocumentCache, getMatchedPositionsFromDoc } from './core/cache'
import { ContextManager } from './core/context'
import { defaultSettings } from './types'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

let settings: ServerSettings = { ...defaultSettings }
let contextManager: ContextManager

function getSettings() {
  return settings
}

function getContextManager() {
  return contextManager
}

connection.onInitialize((params) => {
  const workspaceFolders = params.workspaceFolders
  const rootUri = workspaceFolders?.[0]?.uri || params.rootUri

  if (rootUri) {
    const rootPath = uriToFsPath(rootUri)
    contextManager = new ContextManager(rootPath, connection)

    contextManager.events.on('contextReload', (ctx) => {
      resetAutoCompleteCache(ctx)
    })
    contextManager.events.on('contextUnload', (ctx) => {
      resetAutoCompleteCache(ctx)
    })
    contextManager.events.on('unload', (ctx) => {
      resetAutoCompleteCache(ctx)
    })
  }

  // Register all LSP capabilities
  registerCompletion(connection, documents, getContextManager, getSettings)
  registerHover(connection, documents, getContextManager, getSettings)
  registerColorProvider(connection, documents, getContextManager, getSettings)
  registerReferences(connection, documents, getContextManager, getSettings)

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['-', ':', ' ', '"', '\''],
      },
      hoverProvider: true,
      referencesProvider: true,
      colorProvider: true,
    },
  }
})

connection.onInitialized(async () => {
  if (contextManager)
    await contextManager.ready
  connection.console.log('✅ UnoCSS Language Server initialized')
})

connection.onDidChangeConfiguration((change) => {
  const unocssSettings = change.settings?.unocss
  if (unocssSettings) {
    settings = {
      ...defaultSettings,
      ...unocssSettings,
      autocompleteMatchType: unocssSettings?.autocomplete?.matchType ?? defaultSettings.autocompleteMatchType,
      autocompleteStrict: unocssSettings?.autocomplete?.strict ?? defaultSettings.autocompleteStrict,
      autocompleteMaxItems: unocssSettings?.autocomplete?.maxItems ?? defaultSettings.autocompleteMaxItems,
    }
    resetAutoCompleteCache()
  }
})

connection.onRequest('unocss/reloadConfig', async () => {
  if (contextManager) {
    // Clear all document caches before reloading
    clearAllCache()
    await contextManager.reload()
    return { success: true }
  }
  return { success: false }
})

connection.onRequest('unocss/getMatchedCount', async (params: { uri: string }) => {
  if (!contextManager)
    return { count: 0 }

  const doc = documents.get(params.uri)
  if (!doc)
    return { count: 0 }

  const id = uriToFsPath(params.uri)
  const code = doc.getText()
  const ctx = await contextManager.resolveClosestContext(code, id)
  if (!ctx)
    return { count: 0 }

  const result = await ctx.uno.generate(code, { id, preflights: false, minify: true })
  return { count: result.matched.size }
})

connection.onRequest('unocss/getMatchedPositions', async (params: { uri: string }) => {
  if (!contextManager)
    return { positions: [] }

  const doc = documents.get(params.uri)
  if (!doc)
    return { positions: [] }

  const id = uriToFsPath(params.uri)
  if (!contextManager.isTarget(id))
    return { positions: [] }

  const code = doc.getText()
  if (!code)
    return { positions: [] }

  const ctx = await contextManager.resolveClosestContext(code, id)
  if (!ctx)
    return { positions: [] }

  const isTarget = ctx.filter(code, id)
    || code.includes(INCLUDE_COMMENT_IDE)
    || contextManager.configSources.includes(id)
    || isCssId(id)

  if (!isTarget)
    return { positions: [] }

  try {
    const positions = await getMatchedPositionsFromDoc(
      ctx.uno,
      code,
      id,
      settings.strictAnnotationMatch,
    )

    return {
      positions: positions.map(([start, end, className]) => ({
        start: doc.positionAt(start),
        end: doc.positionAt(end),
        className,
      })),
    }
  }
  catch {
    return { positions: [] }
  }
})

documents.onDidChangeContent((change) => {
  clearDocumentCache(uriToFsPath(change.document.uri))
})

documents.onDidClose((event) => {
  clearDocumentCache(uriToFsPath(event.document.uri))
})

documents.listen(connection)
connection.listen()

function uriToFsPath(uri: string): string {
  try {
    return fileURLToPath(uri)
  }
  catch {
    return uri
  }
}
