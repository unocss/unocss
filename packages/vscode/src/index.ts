import path from 'path'
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

  const _exclude = config.get<FilterPattern>('exclude')
  const _include = config.get<FilterPattern>('include')

  const include: FilterPattern = _include || defaultPipelineInclude
  const exclude: FilterPattern = _exclude || [/[\/](node_modules|dist|\.temp|\.cache|\.vscode)[\/]/, ...defaultPipelineExclude]
  const filter = createFilter(include, exclude)

  const cacheFileLookUp = new Set<string>()
  const cacheContext = new Map()

  const watchConfigMap = ['uno.config.js', 'uno.config.ts', 'unocss.config.js', 'unocss.config.ts']
  const useWatcherUnoConfig = (configUrl: string) => {
    const watcher = workspace.createFileSystemWatcher(configUrl)

    ext.subscriptions.push(watcher.onDidChange(() => {
      cacheContext.get(configUrl).reload()
    }))

    ext.subscriptions.push(watcher.onDidDelete(() => {
      cacheContext.get(configUrl).unload(path.dirname(configUrl))
      watcher.dispose()
      cacheFileLookUp.clear()
    }))

    return () => watcher.dispose()
  }

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

    const configUrl = await findUp(watchConfigMap, { cwd: url })
    if (!configUrl) {
      cacheFileLookUp.add(url)
      return
    }

    const cwd = path.dirname(configUrl)
    if (cacheFileLookUp.has(cwd))
      return

    cacheFileLookUp.add(cwd)

    const contextLoader = await registerRoot(ext, status, cwd)
    const reload = async () => {
      log.appendLine('🔁 Reloading...')
      await contextLoader.reload()
      log.appendLine('✅ Reloaded.')
    }
    const unload = (configDir: string) => {
      log.appendLine('🔁 unloading...')
      contextLoader.unload(configDir)
      cacheFileLookUp.delete(cwd)
      cacheContext.delete(configUrl)
      log.appendLine('✅ unloaded.')
    }
    const dispose = useWatcherUnoConfig(configUrl)

    cacheContext.set(configUrl, {
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
