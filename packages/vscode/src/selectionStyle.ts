import { MarkdownString, Position, Range, window, workspace } from 'vscode'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import type { TextEditorSelectionChangeEvent } from 'vscode'
import { log } from './log'
import { throttle } from './utils'
import type { ContextLoader } from './contextLoader'
import { getMatchedPositionsFromCode } from './integration'

export async function registerSelectionStyle(cwd: string, contextLoader: ContextLoader) {
  const hasSelectionStyle = (): boolean => workspace.getConfiguration().get('unocss.selectionStyle') ?? true

  const integrationDecoration = window.createTextEditorDecorationType({
    after: {
      textDecoration: 'width:10rem;height:10rem;content: \'😎\';cursor: pointer',
    },
  })

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
      let code = editor.textEditor.document.getText(range)
      if (!code.startsWith('<'))
        code = `<div ${code}`
      if (!code.endsWith('>'))
        code = `${code} >`
      const ctx = await contextLoader.resolveContext(code, id) || (await contextLoader.resolveClosestContext(code, id))
      const result = await getMatchedPositionsFromCode(ctx.uno, code)
      if (!result.length)
        return reset()

      const uniqMap = new Map()
      for (const [start, end, className] of result)
        uniqMap.set(`${start}-${end}`, className)

      const sheetMap = new Map()
      for (const [, className] of uniqMap.entries()) {
        const result = await ctx.uno.generate(new Set([className]), { preflights: false, safelist: false })
        const [[key, value]] = Array.from(result.sheet) as Array<[string, any[]]>
        if (!sheetMap.get(key))
          sheetMap.set(key, value)
        else sheetMap.get(key).push(value[0])
      }

      const list = []
      const pseudoReg = /.+(::\w+)/
      const pseudoMap = new Map()
      for (const [key, value] of sheetMap) {
        const arr = []
        const metaPseudoMap = new Map()
        for (const val of value) {
          const match = val[1].match(pseudoReg)
          const map = key ? metaPseudoMap : pseudoMap
          if (match) {
            if (!map.get(match[1]))
              map.set(match[1], [])
            map.get(match[1]).push(val[2])
          }
          else {
            arr.push(val[2])
          }
        }
        if (!key) {
          arr.length && list.unshift(`{${arr.join('')}}`)
        }
        else {
          const pseudoList = []
          for (const [key, value] of metaPseudoMap.entries())
            pseudoList.push(`${key}{${value.join('')}}`)

          pseudoList.length && list.push(`${key}{${pseudoList.join('')}}`)
          arr.length && list.push(`${key}{${arr.join('')}}`)
        }
      }
      const pseudoList = []
      for (const [key, value] of pseudoMap.entries())
        pseudoList.push(`${key}{${value.join('')}}`)

      const prettified = prettier.format(`${list.concat(pseudoList).join('')}`, {
        parser: 'css',
        plugins: [parserCSS],
      })

      editor.textEditor.setDecorations(integrationDecoration, [{
        range,
        get hoverMessage() {
          return new MarkdownString(`\`\`\`css\n${prettified.trim()}\n\`\`\``)
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
