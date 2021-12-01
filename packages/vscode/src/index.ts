import { DecorationOptions, DecorationRangeBehavior, MarkdownString, Range, StatusBarAlignment, window, workspace } from 'vscode'

import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { getMatchedPositions } from '../../inspector/client/composables/pos'
import { createContext } from '../../plugins-common'

export async function activate() {
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath
  if (!cwd)
    return

  const context = createContext(cwd)

  const { sources } = await context.ready

  if (!sources.length)
    return

  const { uno, filter } = context
  const status = window.createStatusBarItem(StatusBarAlignment.Right, 200)
  status.text = 'UnoCSS'

  workspace.onDidSaveTextDocument(async(doc) => {
    if (sources.includes(doc.uri.fsPath)) {
      await context.reloadConfig()
      window.showInformationMessage(`UnoCSS: Config reload by ${doc.uri.fsPath}`)
    }
  })

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  async function updateAnnotation(editor = window.activeTextEditor) {
    const doc = editor?.document
    if (!doc)
      return reset()

    const code = doc.getText()
    const id = doc.uri.fsPath

    if (!filter(code, id))
      return reset()

    const result = await uno.generate(code, { id, preflights: false, minify: true })

    const ranges: DecorationOptions[] = await Promise.all(
      getMatchedPositions(code, Array.from(result.matched))
        .map(async(i): Promise<DecorationOptions> => {
          const css = (await uno.generate(new Set([i[2]]), { minify: true, preflights: false })).css
          const prettified = prettier.format(css, {
            parser: 'css',
            plugins: [parserCSS],
          })
          return {
            range: new Range(doc.positionAt(i[0]), doc.positionAt(i[1])),
            hoverMessage: new MarkdownString(`\`\`\`css\n${prettified}\n\`\`\``),
          }
        }),
    )

    editor.setDecorations(UnderlineDecoration, ranges)
    status.text = `UnoCSS: ${result.matched.size}`
    status.tooltip = new MarkdownString(`${result.matched.size} utilities used in this file`)
    status.show()

    function reset() {
      editor?.setDecorations(UnderlineDecoration, [])
      status.hide()
    }
  }

  window.onDidChangeActiveTextEditor(updateAnnotation)
  workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      updateAnnotation()
  })
  updateAnnotation()
}

export function deactivate() {}
