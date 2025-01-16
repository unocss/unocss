import type { TextEditorSelectionChangeEvent } from 'vscode'
import type { ContextLoader } from './contextLoader'
import { getMatchedPositionsFromCode } from '#integration/match-positions'
import { regexScopePlaceholder, TwoKeyMap } from '@unocss/core'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { MarkdownString, Position, Range, window } from 'vscode'
import { getConfig } from './configs'
import { log } from './log'
import { addRemToPxComment, throttle } from './utils'

export async function registerSelectionStyle(loader: ContextLoader) {
  const config = getConfig()
  const integrationDecoration = window.createTextEditorDecorationType({})

  async function selectionStyle(editor: TextEditorSelectionChangeEvent) {
    try {
      if (!config.selectionStyle)
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

      const ctx = await loader.resolveClosestContext(code, id)
      if (!ctx)
        return reset()

      const remToPxRatio = config.remToPxPreview
        ? config.remToPxRatio
        : -1

      const result = await getMatchedPositionsFromCode(ctx.uno, code)
      if (result.length <= 1)
        return reset()

      const uniqMap = new Map<string, string>()
      for (const [start, end, className] of result)
        uniqMap.set(`${start}-${end}`, className)

      const classNamePlaceholder = '___'
      const sheetMap = new TwoKeyMap<string | undefined, string, string>()
      await Promise.all(Array.from(uniqMap.values())
        .map(async (name) => {
          if (!ctx)
            return
          const tokens = await ctx.uno.parseToken(name, classNamePlaceholder) || []
          tokens.forEach(([, className, cssText, media]) => {
            if (className && cssText) {
              cssText = addRemToPxComment(cssText, remToPxRatio)
              const selector = className
                .replace(`.${classNamePlaceholder}`, '&')
                .replace(regexScopePlaceholder, ' ')
                .trim()
              sheetMap.set(media, selector, (sheetMap.get(media, selector) || '') + cssText)
            }
          })
        }))

      const css = Array.from(sheetMap._map.entries())
        .map(([media, map]) => {
          const body = Array.from(map.keys())
            .sort()
            .map(selector => `${selector}{${map.get(selector)}}`)
            .join('\n')
          return media ? `${media}{${body}}` : body
        })
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
    catch (e: any) {
      log.appendLine('⚠️ Error on selectionStyle')
      log.appendLine(String(e.stack ?? e))
    }
  }

  const dispose = window.onDidChangeTextEditorSelection(throttle(selectionStyle, 200))

  loader.events.on('unload', () => {
    dispose.dispose()
  })
}
