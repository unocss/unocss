import type { ExtensionContext } from 'vscode'
import type { LanguageClient } from 'vscode-languageclient/node'
import { Position, commands as vscodeCommands, window } from 'vscode'
import { commands as commandNames } from './generated/meta'
import { log } from './log'

const skipMap = {
  '<!-- @unocss-skip -->': ['<!-- @unocss-skip-start -->\n', '\n<!-- @unocss-skip-end -->'],
  '/* @unocss-skip */': ['/* @unocss-skip-start */\n', '\n/* @unocss-skip-end */'],
  '// @unocss-skip': ['// @unocss-skip-start\n', '\n// @unocss-skip-end'],
}

export function registerCommands(
  context: ExtensionContext,
  client: LanguageClient,
  decorations?: { updateDecorations: () => Promise<void>, reset: (editor?: any) => void },
) {
  context.subscriptions.push(
    vscodeCommands.registerCommand(
      commandNames.reload,
      async () => {
        log.appendLine('♻️ Reloading...')
        await client.sendRequest('unocss/reloadConfig')
        log.appendLine('🔵 Reloaded.')

        if (decorations) {
          await decorations.updateDecorations()
        }
      },
    ),
    vscodeCommands.registerCommand(
      commandNames.insertSkipAnnotation,
      async () => {
        const activeTextEditor = window.activeTextEditor
        if (!activeTextEditor)
          return
        const selection = activeTextEditor.selection
        if (!selection)
          return
        const key = await window.showQuickPick(Object.keys(skipMap))
        if (!key)
          return
        const [insertStart, insertEnd] = skipMap[key as keyof typeof skipMap]
        activeTextEditor.edit((builder) => {
          builder.insert(new Position(selection.start.line, 0), insertStart)
          builder.insert(selection.end, insertEnd)
        })
      },
    ),
  )
}
