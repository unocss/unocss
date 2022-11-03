import path from 'path'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { version } from '../package.json'
import { log } from './log'
import { registerAnnotations } from './annotation'
import { registerAutoComplete } from './autocomplete'
import { ContextLoader } from './contextLoader'
import { registerSelectionStyle } from './selectionStyle'

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

  const root = config.get<string>('root')
  const cwd = root ? path.resolve(projectPath, root) : projectPath

  const contextLoader = new ContextLoader(cwd)

  ext.subscriptions.push(
    commands.registerCommand('unocss.reload', async () => {
      log.appendLine('🔁 Reloading...')
      await contextLoader.reload()
      log.appendLine('✅ Reloaded.')
    }),
  )

  await contextLoader.ready

  const hasConfig = await contextLoader.loadContextInDirectory(cwd)
  // TODO: improve this to re-enable after configuration created
  if (!hasConfig) {
    log.appendLine('➖ No config found, UnoCSS is disabled')
    return
  }

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  registerAutoComplete(cwd, contextLoader, ext)
  registerAnnotations(cwd, contextLoader, status, ext)
  registerSelectionStyle(cwd, contextLoader)
}

export function deactivate() {}
