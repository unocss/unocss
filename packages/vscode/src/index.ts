import { relative } from 'path'
import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, window, workspace } from 'vscode'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'
import { createContext } from '../../plugins-common/context'
import { log } from './log'
import { registerAnnonations } from './annonation'
import { registerAutoComplete } from './autocomplete'

export async function activate(ext: ExtensionContext) {
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath
  if (!cwd)
    return

  const context = createContext(cwd, {}, [
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
  ])

  const { sources } = await context.ready

  if (!sources.length) {
    log.appendLine('No config files found, disabled')
    return
  }

  log.appendLine(`Configuration loaded from\n${sources.map(s => ` - ${relative(cwd, s)}`).join('\n')}`)

  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  registerAutoComplete(context, ext)
  registerAnnonations(cwd, context, status)
}

export function deactivate() {}
