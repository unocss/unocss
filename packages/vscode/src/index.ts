import path from 'path'
import type { ExtensionContext, StatusBarItem } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { findUp } from 'find-up'
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

  const registerUnocss = async () => {
    const url = window.activeTextEditor?.document.uri.fsPath
    if (!url)
      return
    if (/node_modules/.test(url))
      return
    const target = await findUp(['package.json'], { cwd: url })
    if (!target)
      return
    const cwd = target.slice(0, -13)
    if (cacheMap.has(cwd))
      return
    cacheMap.add(cwd)
    const contextLoader = await registerRoot(ext, status, cwd)

    ext.subscriptions.push(
      commands.registerCommand('unocss.reload', async () => {
        log.appendLine('🔁 Reloading...')
        await contextLoader.reload()
        log.appendLine('✅ Reloaded.')
      }),
    )
  }

  try {
    await registerUnocss()
    ext.subscriptions.push(window.onDidChangeActiveTextEditor(registerUnocss))
  }
  catch (e: any) {
    log.appendLine(String(e.stack ?? e))
  }
}

export function deactivate() { }
