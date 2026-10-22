import type { ExtensionContext } from 'vscode'
import type { LanguageClient } from 'vscode-languageclient/node'
import { MarkdownString, StatusBarAlignment, window } from 'vscode'
import { commands, displayName } from '../generated/meta'

export function createStatusBar(context: ExtensionContext, client: LanguageClient) {
  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = displayName
  status.command = commands.reload
  context.subscriptions.push(status)

  // Update status bar when active editor changes
  const updateStatusBar = async () => {
    const editor = window.activeTextEditor
    if (!editor) {
      status.hide()
      return
    }

    try {
      const result = await client.sendRequest<{ count: number }>('unocss/getMatchedCount', {
        uri: editor.document.uri.toString(),
      })
      if (result.count > 0) {
        status.text = `UnoCSS: ${result.count}`
        const tooltip = new MarkdownString()
        tooltip.appendMarkdown(`${result.count} utilities used in this file\n\n`)
        tooltip.appendMarkdown('**Click to reload UnoCSS configuration**')
        status.tooltip = tooltip
        status.show()
      }
      else {
        status.hide()
      }
    }
    catch {
      status.hide()
    }
  }

  context.subscriptions.push(window.onDidChangeActiveTextEditor(updateStatusBar))

  updateStatusBar()

  return status
}
