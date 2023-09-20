import path from 'path'
import { watch } from 'fs'
import type { ExtensionContext, StatusBarItem } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { findUp } from 'find-up'
import { createFilter } from '@rollup/pluginutils'
import { version } from '../package.json'
import { log } from './log'
import { registerAnnotations } from './annotation'
import { registerAutoComplete } from './autocomplete'
import { ContextLoader } from './contextLoader'
import { registerSelectionStyle } from './selectionStyle'
import { isFulfilled, isRejected } from './utils'

async function registerRoot(ext: ExtensionContext, status: StatusBarItem, cwd: string) {
  const contextLoader = new ContextLoader(cwd)
  await contextLoader.ready

  const hasConfig = await contextLoader.loadContextInDirectory(cwd)
  if (hasConfig) {
    registerAutoComplete(cwd, contextLoader, ext)
    registerAnnotations(cwd, contextLoader, status, ext)
    registerSelectionStyle(cwd, contextLoader)
  }

  return contextLoader
}

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
  const exclude = config.get<string | string[]>('exclude')
  const include = config.get<string | string[]>('include')

  if (Array.isArray(root) && root.length) {
    const cwds = root.map(dir => path.resolve(projectPath, dir))
    const contextLoadersResult = await Promise.allSettled(
      cwds.map(cwd => registerRoot(ext, status, cwd)),
    )

    ext.subscriptions.push(
      commands.registerCommand('unocss.reload', async () => {
        log.appendLine('🔁 Reloading...')
        await Promise.all(
          contextLoadersResult
            .filter(isFulfilled)
            .map(result => result.value.reload),
        )
        log.appendLine('✅ Reloaded.')
      }),
    )

    for (const result of contextLoadersResult.filter(isRejected)) {
      const e = result.reason
      log.appendLine(String(e.stack ?? e))
    }
    return
  }
  // now if the root is an array, then it is an empty array

  const cacheMap = new Set()
  const contextCache = new Map()
  const watchConfigMap = ['uno.config.js', 'uno.config.ts', 'unocss.config.js', 'unocss.config.ts']
  const useWatcherUnoConfig = (filepath: string) => {
    const watcher = watch(filepath, 'utf-8', async (type, filename) => {
      if (type === 'change') {
        contextCache.get(filepath)()
      }
      else if (type === 'rename') {
        watcher.close()
        if (filename && watchConfigMap.includes(filename)) {
          const originContextReload = contextCache.get(filepath)
          contextCache.delete(filepath)
          const newConfigUrl = path.resolve(path.dirname(filepath), filename)
          contextCache.set(newConfigUrl, originContextReload)
          useWatcherUnoConfig(newConfigUrl)
        }
      }
    })
  }

  const registerUnocss = async () => {
    const url = window.activeTextEditor?.document.uri.fsPath
    if (!url)
      return

    if (cacheMap.has(url))
      return

    const defaultExclude = exclude && exclude.length ? exclude : /[\/](node_modules|dist|\.temp|\.cache|\.vscode)[\/]/
    const defaultInclude = include && include.length ? include : /.*\.(ts|js|tsx|jsx|solid|svelte|vue|html)$/

    const filter = createFilter(defaultInclude, defaultExclude)
    if (!filter(url))
      return

    const target = await findUp(watchConfigMap, { cwd: url })

    if (!target || cacheMap.has(target))
      return

    cacheMap.add(url)
    cacheMap.add(target)
    const cwd = path.dirname(target)

    const contextLoader = await registerRoot(ext, status, cwd)
    const reload = async () => {
      log.appendLine('🔁 Reloading...')
      await contextLoader.reload()
      log.appendLine('✅ Reloaded.')
    }
    contextCache.set(url, () => reload())
    useWatcherUnoConfig(url)
    ext.subscriptions.push(
      commands.registerCommand('unocss.reload', reload),
    )
  }

  try {
    await registerUnocss()
    if (!root || !root.length)
      ext.subscriptions.push(window.onDidChangeActiveTextEditor(registerUnocss))
  }
  catch (e: any) {
    log.appendLine(String(e.stack ?? e))
  }
}

export function deactivate() { }
