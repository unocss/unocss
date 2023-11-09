import path, { dirname } from 'path'
import type { ExtensionContext, StatusBarItem, WorkspaceConfiguration } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { findUp } from 'find-up'
import type { FilterPattern } from '@rollup/pluginutils'
import { createFilter } from '@rollup/pluginutils'
import { version } from '../package.json'
import { log } from './log'
import { registerAnnotations } from './annotation'
import { registerAutoComplete } from './autocomplete'
import { ContextLoader } from './contextLoader'
import { registerSelectionStyle } from './selectionStyle'
import { isRejected } from './utils'
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

  const ctx = (Array.isArray(root) && root.length)
    ? await rootRegisterManual(ext, root, projectPath)
    : await rootRegisterAuto(ext, typeof root === 'string' ? root : projectPath, config)

  registerAutoComplete(ctx, ext)
  registerAnnotations(ctx, status, ext)
  registerSelectionStyle(ctx)

  ext.subscriptions.push(
    commands.registerCommand('unocss.reload', async () => {
      log.appendLine('🔁 Reloading...')
      await ctx.reload()
      log.appendLine('✅ Reloaded.')
    }),
  )
}

async function rootRegisterManual(
  _ext: ExtensionContext,
  root: string[],
  projectPath: string,
) {
  log.appendLine('📂 Manual roots search mode.' + `\n${root.map(i => `  - ${i}`).join('\n')}`)

  const roots = root.map(dir => path.resolve(projectPath, dir))

  const ctx = roots.length === 1
    ? new ContextLoader(roots[0])
    : new ContextLoader(projectPath)

  await ctx.ready

  const loaderResult = await Promise.allSettled(
    roots.map(cwd => ctx.loadContextInDirectory(cwd)),
  )

  for (const result of loaderResult.filter(isRejected)) {
    const e = result.reason
    log.appendLine(String(e.stack ?? e))
  }

  return ctx
}

async function rootRegisterAuto(
  ext: ExtensionContext,
  root: string,
  config: WorkspaceConfiguration,
) {
  log.appendLine('📂 Auto roots search mode.')

  const _exclude = config.get<FilterPattern>('exclude')
  const _include = config.get<FilterPattern>('include')

  const include: FilterPattern = _include || defaultPipelineInclude
  const exclude: FilterPattern = _exclude || [/[\/](node_modules|dist|\.temp|\.cache|\.vscode)[\/]/, ...defaultPipelineExclude]
  const filter = createFilter(include, exclude)

  const ctx = new ContextLoader(root)
  await ctx.ready

  const cacheFileLookUp = new Set<string>()

  const watcher = workspace.createFileSystemWatcher('**/{uno,unocss}.config.{js,ts}')

  ext.subscriptions.push(watcher.onDidChange(async (uri) => {
    const dir = dirname(uri.fsPath)
    await ctx.unloadContext(dir)
    await ctx.loadContextInDirectory(dir)
  }))

  ext.subscriptions.push(watcher.onDidDelete((uri) => {
    ctx.unloadContext(dirname(uri.fsPath))
    cacheFileLookUp.clear()
  }))

  const configNames = [
    'uno.config.js',
    'uno.config.ts',
    'unocss.config.js',
    'unocss.config.ts',
  ]

  const registerUnocss = async () => {
    const url = window.activeTextEditor?.document.uri.fsPath
    if (!url)
      return

    if (cacheFileLookUp.has(url))
      return

    if (!filter(url)) {
      cacheFileLookUp.add(url)
      return
    }

    const dir = path.dirname(url)
    if (cacheFileLookUp.has(dir)) {
      cacheFileLookUp.add(url)
      return
    }

    const configUrl = await findUp(configNames, { cwd: url })
    if (!configUrl) {
      cacheFileLookUp.add(url)
      return
    }

    const cwd = path.dirname(configUrl)
    if (cacheFileLookUp.has(cwd))
      return

    cacheFileLookUp.add(cwd)
    await ctx.loadContextInDirectory(cwd)
  }

  try {
    await registerUnocss()
    if (!root || !root.length)
      ext.subscriptions.push(window.onDidChangeActiveTextEditor(registerUnocss))
  }
  catch (e: any) {
    log.appendLine(String(e.stack ?? e))
  }

  return ctx
}

export function deactivate() { }
