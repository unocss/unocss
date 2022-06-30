import path from 'path'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { version } from '../package.json'
import { log } from './log'
import { registerAnnotations } from './annotation'
import { registerAutoComplete } from './autocomplete'
import { ContextLoader } from './contextLoader'

export async function activate(ext: ExtensionContext) {
  const projectPath = workspace.workspaceFolders?.[0].uri.fsPath
  if (!projectPath)
    return

  const config = workspace.getConfiguration('unocss')
  const disabled = config.get<boolean>('disable', false)
  if (disabled)
    return

  const root = config.get<string>('root')
  const cwd = root ? path.resolve(projectPath, root) : projectPath

  log.appendLine(`UnoCSS for VS Code  v${version} ${process.cwd()}`)

  const contextLoader = new ContextLoader(cwd)

  const hasConfig = await contextLoader.loadContextInDirectory(cwd)
  if (!hasConfig)
    return

  await contextLoader.ready

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  registerAutoComplete(cwd, contextLoader, ext)
  registerAnnotations(cwd, contextLoader, status, ext)

  ext.subscriptions.push(commands.registerCommand('unocss.reload', async () => {
    await contextLoader.reload()
    log.appendLine('[info] UnoCSS reloaded.')
  }))
}

export function deactivate() {}
