import { DecorationOptions, DecorationRangeBehavior, MarkdownString, Range, window, workspace } from 'vscode'
import { loadConfig } from 'unconfig'
import { createGenerator, UserConfig } from '@unocss/core'
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { getMatchedPositions } from '../../packages/inspector/client/composables/pos'

export async function activate() {
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath
  if (!cwd)
    return

  const result = await loadConfig<UserConfig>({
    sources: [
      {
        files: 'unocss.config',
      },
      {
        files: 'uno.config',
      },
    ],
    cwd,
  })
  if (result.sources.length)
    window.showInformationMessage(`UnoCSS: Configure load from ${result.sources[0]}`)
  else
    return

  const uno = createGenerator(result.config)

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  async function updateAnnotation() {
    const editor = window.activeTextEditor
    const doc = editor?.document
    if (!doc)
      return

    const text = doc.getText()
    const result = await uno.generate(text, { id: doc.uri.fsPath, preflights: false })

    const ranges: DecorationOptions[] = await Promise.all(
      getMatchedPositions(text, Array.from(result.matched))
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
  }

  window.onDidChangeActiveTextEditor(updateAnnotation)
  workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      updateAnnotation()
  })
  updateAnnotation()
}

export function deactivate() {}
