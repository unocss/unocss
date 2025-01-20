import type { FilterPattern } from '@rollup/pluginutils'
import type { ExtensionContext, StatusBarItem } from 'vscode'
import path, { dirname } from 'path'
import process from 'process'
import { defaultPipelineExclude, defaultPipelineInclude } from '#integration/defaults'
import { createFilter } from '@rollup/pluginutils'
import { toArray } from '@unocss/core'
import { findUp } from 'find-up'
import { commands, Position, StatusBarAlignment, window, workspace } from 'vscode'
import { getConfig } from './configs'
import { ContextLoader } from './contextLoader'
import { commands as commandNames, displayName, version } from './generated/meta'
import { log } from './log'

const skipMap = {
  '<!-- @unocss-skip -->': ['<!-- @unocss-skip-start -->\n', '\n<!-- @unocss-skip-end -->'],
  '/* @unocss-skip */': ['/* @unocss-skip-start */\n', '\n/* @unocss-skip-end */'],
  '// @unocss-skip': ['// @unocss-skip-start\n', '\n// @unocss-skip-end'],
}

export async function activate(ext: ExtensionContext) {
  // Neither Jiti2 nor Tsx supports running in VS Code yet
  // We have to use Jiti1 for now
  process.env.IMPORTX_LOADER = 'jiti-v1'

  log.appendLine(`⚪️ UnoCSS for VS Code v${version}\n`)

  const projectPath = workspace.workspaceFolders?.[0].uri.fsPath
  if (!projectPath) {
    log.appendLine('➖ No active workspace found, UnoCSS is disabled')
    return
  }

  const config = getConfig()
  if (config.disable) {
    log.appendLine('➖ Disabled by configuration')
    return
  }

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = displayName

  const root = config.root

  const loader = await rootRegister(
    ext,
    Array.isArray(root) && !root.length
      ? [projectPath]
      : root
        ? toArray(root).map(r => path.resolve(projectPath, r))
        : [projectPath],
    status,
  )

  ext.subscriptions.push(
    commands.registerCommand(
      commandNames.reload,
      async () => {
        log.appendLine('🔁 Reloading...')
        await loader.reload()
        log.appendLine('✅ Reloaded.')
      },
    ),
    commands.registerCommand(
      commandNames.insertSkipAnnotation,
      async () => {
        const activeTextEditor = window.activeTextEditor
        if (!activeTextEditor)
          return
        const selection = activeTextEditor.selection
        if (!selection)
          return
        // pick <!-- @unocss-skip-start --> or // @unocss-skip-start
        const key = await window.showQuickPick(Object.keys(skipMap))
        if (!key)
          return
        const [insertStart, insertEnd] = skipMap[key as keyof typeof skipMap]
        activeTextEditor.edit((builder) => {
          builder.insert(new Position(selection.start.line, 0), insertStart)
          builder.insert(selection.end, insertEnd)
        })
      },
    ),
  )
}

async function rootRegister(
  ext: ExtensionContext,
  root: string[],
  status: StatusBarItem,
) {
  log.appendLine('📂 roots search mode.')

  const config = getConfig()

  const include: FilterPattern = config.include || defaultPipelineInclude
  const exclude: FilterPattern = config.exclude || [/[\\/](node_modules|dist|\.temp|\.cache|\.vscode)[\\/]/, ...defaultPipelineExclude]
  const filter = createFilter(include, exclude)

  const ctx = new ContextLoader(root[0], ext, status)
  await ctx.ready

  const cacheFileLookUp = new Set<string>()

  const rootCache = new Set<string>()

  const watcher = workspace.createFileSystemWatcher('**/{uno,unocss}.config.{js,ts}')

  ext.subscriptions.push(watcher.onDidChange(async (uri) => {
    const dir = dirname(uri.fsPath)
    await ctx.unloadContext(dir)
    await ctx.loadContextInDirectory(dir)
  }))

  ext.subscriptions.push(watcher.onDidDelete((uri) => {
    const dir = dirname(uri.fsPath)
    rootCache.delete(dir)
    ctx.unloadContext(dir)
    cacheFileLookUp.clear()
  }))

  const configNames = [
    'uno.config.js',
    'uno.config.ts',
    'unocss.config.js',
    'unocss.config.ts',
  ]

  const registerUnocss = async (url = window.activeTextEditor?.document.uri.fsPath) => {
    if (!url)
      return

    if (cacheFileLookUp.has(url))
      return

    if (!filter(url))
      return

    cacheFileLookUp.add(url)

    // root has been created
    if ([...rootCache].some(root => url.startsWith(root)))
      return

    const configUrl = await findUp(configNames, { cwd: url })

    if (!configUrl)
      return

    const cwd = path.dirname(configUrl)
    // Prevent sub-repositories from having the same naming prefix
    rootCache.add(`${cwd}/`)

    await ctx.loadContextInDirectory(cwd)
  }

  try {
    await Promise.all(root.map(registerUnocss))
    // Take effect immediately on the current file
    registerUnocss()
    ext.subscriptions.push(window.onDidChangeActiveTextEditor(() => registerUnocss()))
  }
  catch (e: any) {
    log.appendLine(String(e.stack ?? e))
  }

  return ctx
}

export function deactivate() { }
