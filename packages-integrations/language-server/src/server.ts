import type { Disposable } from 'vscode-languageserver/node'
import type { ServerSettings } from './types'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { TextDocument } from 'vscode-languageserver-textdocument'
import {
  createConnection,
  DidChangeWatchedFilesNotification,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
  WatchKind,
} from 'vscode-languageserver/node'
import { registerColorProvider } from './capabilities/colorProvider'
import { registerCompletion, resetAutoCompleteCache } from './capabilities/completion'
import { registerHover } from './capabilities/hover'
import { registerReferences } from './capabilities/references'
import { clearAllCache, clearDocumentCache, getMatchedPositionsFromDoc } from './core/cache'
import { ContextManager } from './core/context'
import { defaultSettings } from './types'
import { resolveWorkspaceRoots } from './utils/roots'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

interface UnocssSettingsInput extends Partial<Omit<ServerSettings, 'autocompleteMatchType' | 'autocompleteStrict' | 'autocompleteMaxItems'>> {
  autocomplete?: {
    matchType?: ServerSettings['autocompleteMatchType']
    strict?: boolean
    maxItems?: number
  }
}

interface WorkspaceInitializationOptions {
  workspaceFileDir?: string
  workspaceFolderPaths?: string[]
}

interface WorkspaceContextState {
  rootPath?: string
  fileDir?: string
  folderPaths: string[]
}

let settings: ServerSettings = { ...defaultSettings }
let contextManager: ContextManager
let hasWatchedFilesCapability = false
let serverInitialized = false
let watcherDisposable: Disposable | undefined
const workspaceContext: WorkspaceContextState = {
  folderPaths: [],
}

function mergeSettings(unocssSettings: UnocssSettingsInput = {}) {
  settings = {
    ...defaultSettings,
    ...unocssSettings,
    autocompleteMatchType: unocssSettings?.autocomplete?.matchType ?? defaultSettings.autocompleteMatchType,
    autocompleteStrict: unocssSettings?.autocomplete?.strict ?? defaultSettings.autocompleteStrict,
    autocompleteMaxItems: unocssSettings?.autocomplete?.maxItems ?? defaultSettings.autocompleteMaxItems,
  }
}

function resolveConfiguredRoots(root: string | string[] | undefined): string[] {
  return resolveWorkspaceRoots(root, {
    workspaceRootPath: workspaceContext.rootPath,
    workspaceFileDir: workspaceContext.fileDir,
    workspaceFolderPaths: workspaceContext.folderPaths,
  })
}

async function applyConfiguredRoots() {
  if (!contextManager)
    return

  await contextManager.setRoots(resolveConfiguredRoots(settings.root))
}

function updateWorkspaceContext(
  rootUri: string,
  workspaceFolders: { uri: string }[] | null | undefined,
  initializationOptions: WorkspaceInitializationOptions | undefined,
) {
  workspaceContext.rootPath = uriToFsPath(rootUri)
  workspaceContext.fileDir = initializationOptions?.workspaceFileDir
  workspaceContext.folderPaths = initializationOptions?.workspaceFolderPaths
    || workspaceFolders?.map(folder => uriToFsPath(folder.uri))
    || []
}

function createContextManager() {
  if (!workspaceContext.rootPath)
    return

  contextManager = new ContextManager(
    workspaceContext.rootPath,
    connection,
    workspaceContext.folderPaths.length ? workspaceContext.folderPaths : [workspaceContext.rootPath],
  )

  contextManager.events.on('contextReload', (ctx) => {
    resetAutoCompleteCache(ctx)
  })
  contextManager.events.on('contextUnload', (ctx) => {
    resetAutoCompleteCache(ctx)
  })
  contextManager.events.on('unload', (ctx) => {
    resetAutoCompleteCache(ctx)
  })
  contextManager.events.on('contextLoaded', () => {
    void updateConfigWatchers()
  })
}

async function updateConfigWatchers(): Promise<void> {
  if (!hasWatchedFilesCapability || !serverInitialized || !contextManager)
    return

  watcherDisposable?.dispose()
  watcherDisposable = undefined

  const sourceFiles = contextManager.contexts.flatMap(ctx => ctx.getConfigFileList())

  watcherDisposable = await connection.client.register(
    DidChangeWatchedFilesNotification.type,
    {
      watchers: sourceFiles.length
        ? sourceFiles.map(file => ({
            globPattern: {
              baseUri: pathToFileURL(path.dirname(file)).href,
              pattern: path.basename(file),
            },
            kind: WatchKind.Create | WatchKind.Change | WatchKind.Delete,
          }))
        : [{
            globPattern: '**/{uno,unocss,vite,svelte,astro,nuxt,iles}.config.{js,mjs,cjs,ts,mts,cts}',
            kind: WatchKind.Create | WatchKind.Change | WatchKind.Delete,
          }],
    },
  )
}

// Don't crash the server.
process.on('unhandledRejection', (reason) => {
  connection.console.error(`[unocss] Unhandled rejection: ${String(reason)}`)
})
// Same as above.
process.on('uncaughtException', (err) => {
  connection.console.error(`[unocss] Uncaught exception: ${err.message}`)
})

function getSettings() {
  return settings
}

function getContextManager() {
  return contextManager
}

connection.onInitialize((params) => {
  hasWatchedFilesCapability = !!params.capabilities.workspace?.didChangeWatchedFiles?.dynamicRegistration
  const initializationOptions = params.initializationOptions as WorkspaceInitializationOptions | undefined

  const workspaceFolders = params.workspaceFolders
  const rootUri = workspaceFolders?.[0]?.uri || params.rootUri

  if (rootUri) {
    updateWorkspaceContext(rootUri, workspaceFolders, initializationOptions)
    createContextManager()
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
  try {
    mergeSettings(await connection.workspace.getConfiguration('unocss'))
  }
  catch {}

  if (contextManager) {
    await contextManager.ready
    await applyConfiguredRoots()
  }
  serverInitialized = true
  connection.console.log('✅ UnoCSS Language Server initialized')
  await updateConfigWatchers()
})

let configReloadTimer: ReturnType<typeof setTimeout> | undefined

connection.onDidChangeWatchedFiles((_change) => {
  clearTimeout(configReloadTimer)
  configReloadTimer = setTimeout(async () => {
    if (!contextManager)
      return
    connection.console.log('🔄 Config file changed, reloading UnoCSS...')
    clearAllCache()
    await contextManager.reload()
    connection.console.log('🔵 Reloaded.')
    await updateConfigWatchers()
  }, 500)
})

connection.onDidChangeConfiguration(async (change) => {
  const unocssSettings = change.settings?.unocss
  if (unocssSettings) {
    mergeSettings(unocssSettings)
    await applyConfiguredRoots()
    await updateConfigWatchers()
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
