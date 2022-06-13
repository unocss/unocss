import path from 'path'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, window, workspace } from 'vscode'
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
  await contextLoader.loadConfigInDirectory(cwd)

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  registerAutoComplete(contextLoader, ext)
  registerAnnonations(cwd, contextLoader, status, ext)
}

export function deactivate() {}
