import path, { dirname } from 'path'
import type { ExtensionContext, StatusBarItem, WorkspaceConfiguration } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { findUp } from 'find-up'
import type { FilterPattern } from '@rollup/pluginutils'
import { createFilter } from '@rollup/pluginutils'
import { toArray } from '@unocss/core'
import { version } from '../package.json'
import { log } from './log'
import { ContextLoader } from './contextLoader'
import { defaultPipelineExclude, defaultPipelineInclude } from './integration'

export async function activate(ext: ExtensionContext) {
  log.appendLine(`⚪️ UnoCSS for VS Code v${version}\n`)

  const projectPath = workspace.workspaceFolders?.[0].uri.fsPath
  if (!projectPath) {
    log.appendLine('➖ No active workspace found, UnoCSS is disabled')
    return
  }

  const config = workspace.getConfiguration('unocss')
  const disabled = config.get<boolean>('disable', false)
  if (disabled) {
    log.appendLine('➖ Disabled by configuration')
    return
  }

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  const root = config.get<string | string[]>('root')

  const ctx = await rootRegister(ext, Array.isArray(root) && !root.length
    ? [projectPath]
    : root
      ? toArray(root).map(r => path.resolve(projectPath, r))
      : [projectPath], config, status)

  ext.subscriptions.push(
    commands.registerCommand('unocss.reload', async () => {
      log.appendLine('🔁 Reloading...')
      await ctx.reload()
      log.appendLine('✅ Reloaded.')
    }),
  )
}

async function rootRegister(
  ext: ExtensionContext,
  root: string[],
  config: WorkspaceConfiguration,
  status: StatusBarItem,
) {
  log.appendLine('📂 roots search mode.')

  const _exclude = config.get<FilterPattern>('exclude')
  const _include = config.get<FilterPattern>('include')

  const include: FilterPattern = _include || defaultPipelineInclude
  const exclude: FilterPattern = _exclude || [/[\\/](node_modules|dist|\.temp|\.cache|\.vscode)[\\/]/, ...defaultPipelineExclude]
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
