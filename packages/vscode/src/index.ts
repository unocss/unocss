import { relative, resolve } from 'path'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, window, workspace } from 'vscode'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'
import { createContext } from '../../shared-integration/context'
import { version } from '../package.json'
import { resolveOptions as resolveNuxtOptions } from '../../nuxt/src/options'
import { log } from './log'
import { registerAnnonations } from './annonation'
import { registerAutoComplete } from './autocomplete'

export async function activate(ext: ExtensionContext) {
  const projectPath = workspace.workspaceFolders?.[0].uri.fsPath
  if (!projectPath)
    return

  const config = workspace.getConfiguration('unocss')
  const root = config.get<string>('root')
  const cwd = root ? resolve(projectPath, root) : projectPath

  log.appendLine(`UnoCSS for VS Code  v${version} ${process.cwd()}`)

  const context = createContext(
    cwd, {},
    [
      sourcePluginFactory({
        files: [
          'vite.config',
          'svelte.config',
          'astro.config',
        ],
        targetModule: 'unocss/vite',
      }),
      sourceObjectFields({
        files: 'nuxt.config',
        fields: 'unocss',
      }),
    ],
    (result) => {
      if (result.sources.some(s => s.includes('nuxt.config')))
        resolveNuxtOptions(result.config)
    },
  )

  context.updateRoot(cwd)

  let sources: string[] = []
  try {
    sources = (await context.ready).sources
  }
  catch (e) {
    log.appendLine(`[error] ${String(e)}`)
    log.appendLine('[error] Failed to start extension, exiting')
    return
  }

  if (!sources.length) {
    log.appendLine('[warn] No config files found, disabled')
    log.appendLine('[warn] Make sure you have `unocss.config.js` in your workspace root, or change `unocss.root` in your workspace settings')
    return
  }

  log.appendLine(`Configuration loaded from\n${sources.map(s => ` - ${relative(cwd, s)}`).join('\n')}`)

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  registerAutoComplete(context, ext)
  registerAnnonations(cwd, context, status)
}

export function deactivate() {}
