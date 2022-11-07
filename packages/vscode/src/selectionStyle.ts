import { MarkdownString, Position, Range, window, workspace } from 'vscode'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import type { TextEditorSelectionChangeEvent } from 'vscode'
import { regexScopePlaceholder } from '@unocss/core'
import { log } from './log'
import { throttle } from './utils'
import type { ContextLoader } from './contextLoader'
import { getMatchedPositionsFromCode } from './integration'

export async function registerSelectionStyle(cwd: string, contextLoader: ContextLoader) {
  const hasSelectionStyle = (): boolean => workspace.getConfiguration().get('unocss.selectionStyle') ?? true

  const integrationDecoration = window.createTextEditorDecorationType({})

  async function selectionStyle(editor: TextEditorSelectionChangeEvent) {
    try {
      if (!hasSelectionStyle())
        return reset()

      const doc = editor.textEditor.document
      if (!doc)
        return reset()

      const id = doc.uri.fsPath
      const selection = editor.textEditor.selection
      const range = new Range(
        new Position(selection.start.line, selection.start.character),
        new Position(selection.end.line, selection.end.character),
      )
      let code = editor.textEditor.document.getText(range).trim()
      if (!code.startsWith('<'))
        code = `<div ${code}`
      if (!code.endsWith('>'))
        code = `${code} >`
      const ctx = await contextLoader.resolveContext(code, id) || (await contextLoader.resolveClosestContext(code, id))
      const result = await getMatchedPositionsFromCode(ctx.uno, code)
      if (!result.length)
        return reset()

      const uniqMap = new Map<string, string>()
      for (const [start, end, className] of result)
        uniqMap.set(`${start}-${end}`, className)

      const classNamePlaceholder = '___'
      const sheetMap = new Map<string, string>()
      await Promise.all(Array.from(uniqMap.values())
        .map(async (name) => {
          const tokens = await ctx.uno.parseToken(name, classNamePlaceholder) || []
          tokens.forEach((token) => {
            if (token[1] && token[2]) {
              const key = token[1]
                .replace(`.${classNamePlaceholder}`, '&')
                .replace(regexScopePlaceholder, ' ')
                .trim()
              sheetMap.set(key, (sheetMap.get(key) || '') + token[2])
            }
          })
        }),
      )

      const css = Array.from(sheetMap.keys())
        .sort()
        .map(key => `${key}{${sheetMap.get(key)}}`)
        .join('\n')

      const prettified = prettier.format(css, {
        parser: 'css',
        plugins: [parserCSS],
      })

      editor.textEditor.setDecorations(integrationDecoration, [{
        range,
        get hoverMessage() {
          return new MarkdownString(`UnoCSS utilities in the selection will be equivalent to:\n\`\`\`css\n${prettified.trim()}\n\`\`\``)
        },
      }])

      function reset() {
        editor.textEditor.setDecorations(integrationDecoration, [])
      }
    }
    catch (e) {
      log.appendLine('⚠️ Error on selectionStyle')
      log.appendLine(String(e))
    }
  }

  window.onDidChangeTextEditorSelection(throttle(selectionStyle, 200))
}
