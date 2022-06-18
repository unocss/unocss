import path from 'path'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, commands, window, workspace } from 'vscode'
import { version } from '../package.json'
import { log } from './log'
import { registerAnnonations } from './annonation'
import { registerAutoComplete } from './autocomplete'
import { ContextLoader } from './contextLoader'

export async function activate(ext: ExtensionContext) {
  const projectPath = workspace.workspaceFolders?.[0].uri.fsPath
  if (!projectPath)
    return

  const config = workspace.getConfiguration('unocss')
  const root = config.get<string>('root')
  const cwd = root ? path.resolve(projectPath, root) : projectPath

  log.appendLine(`UnoCSS for VS Code  v${version} ${process.cwd()}`)

  const contextLoader = new ContextLoader(cwd)
  await contextLoader.ready

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  registerAutoComplete(contextLoader, ext)
  registerAnnonations(cwd, contextLoader, status, ext)

  ext.subscriptions.push(commands.registerCommand('unocss.reload', async () => {
    await contextLoader.reload()
    log.appendLine('[info] UnoCSS reloaded.')
  }))
}

export function deactivate() {}
