import path from 'path'
import type { ExtensionContext, StatusBarItem, WorkspaceConfiguration } from 'vscode'
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
import { defaultPipelineExclude, defaultPipelineInclude } from './integration'

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

  if (Array.isArray(root) && root.length)
    return await rootRegisterManual(ext, root, projectPath, status)
  else
    return await rootRegisterAuto(ext, root, config, status)
}

async function rootRegisterManual(
  ext: ExtensionContext,
  root: string[],
  projectPath: string,
  status: StatusBarItem,
) {
  log.appendLine('📂 Manual roots search mode.' + `\n${root.map(i => `  - ${i}`).join('\n')}`)

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
}

async function rootRegisterAuto(
  ext: ExtensionContext,
  root: string | string[] | undefined,
  config: WorkspaceConfiguration,
  status: StatusBarItem,
) {
  log.appendLine('📂 Auto roots search mode.')

  const _exclude = config.get<string | string[]>('exclude')
  const _include = config.get<string | string[]>('include')

  const exclude = _exclude && _exclude.length ? _exclude : defaultPipelineExclude
  const include = _include && _include.length ? _include : defaultPipelineInclude
  const filter = createFilter(include, exclude)

  const cacheMap = new Set<string>()
  const contextCache = new Map()

  const watchConfigMap = ['uno.config.js', 'uno.config.ts', 'unocss.config.js', 'unocss.config.ts']
  const useWatcherUnoConfig = (configUrl: string) => {
    const watcher = workspace.createFileSystemWatcher(configUrl)

    ext.subscriptions.push(watcher.onDidChange(() => {
      contextCache.get(configUrl).reload()
      cacheMap.clear()
    }))

    ext.subscriptions.push(watcher.onDidDelete(() => {
      contextCache.get(configUrl).unload(path.dirname(configUrl))
      watcher.dispose()
      cacheMap.clear()
    }))

    return () => watcher.dispose()
  }

  const hasCache = (url: string) => {
    return [...cacheMap].find(cache => url.startsWith(cache))
  }

  const registerUnocss = async () => {
    const url = window.activeTextEditor?.document.uri.fsPath
    if (!url)
      return

    if (hasCache(url))
      return

    if (!filter(url))
      return

    const configUrl = await findUp(watchConfigMap, { cwd: url })

    if (!configUrl || cacheMap.has(configUrl))
      return

    const cwd = path.dirname(configUrl)
    cacheMap.add(cwd)

    const contextLoader = await registerRoot(ext, status, cwd)
    const reload = async () => {
      log.appendLine('🔁 Reloading...')
      await contextLoader.reload()
      log.appendLine('✅ Reloaded.')
    }
    const unload = (configDir: string) => {
      log.appendLine('🔁 unloading...')
      contextLoader.unload(configDir)
      cacheMap.delete(cwd)
      contextCache.delete(configUrl)
      log.appendLine('✅ unloaded.')
    }

    const dispose = useWatcherUnoConfig(configUrl)

    contextCache.set(configUrl, {
      reload,
      unload,
      dispose,
    })
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
