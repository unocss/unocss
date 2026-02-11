import type { ExtensionContext, TextEditor } from 'vscode'
import type { LanguageClient } from 'vscode-languageclient/node'
import { DecorationRangeBehavior, Range, window, workspace } from 'vscode'
import { getConfig } from '../configs'

function throttle<T extends ((...args: any) => any)>(func: T, timeFrame: number): T {
  let lastTime = 0
  let timer: any
  return function (...args) {
    const now = Date.now()
    clearTimeout(timer)
    if (now - lastTime >= timeFrame) {
      lastTime = now
      return func(...args)
    }
    else {
      timer = setTimeout(func, timeFrame, ...args)
    }
  } as T
}

export function registerDecorations(
  context: ExtensionContext,
  client: LanguageClient,
) {
  const config = getConfig()

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const NoneDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  async function updateDecorations(editor = window.activeTextEditor) {
    if (!editor) {
      return reset()
    }

    const doc = editor.document
    const uri = doc.uri.toString()

    try {
      const result = await client.sendRequest<{ positions: Array<{ start: { line: number, character: number }, end: { line: number, character: number }, className: string }> }>('unocss/getMatchedPositions', { uri })

      const docConfig = getConfig(doc)

      const ranges = result.positions.map(pos => ({
        range: new Range(pos.start.line, pos.start.character, pos.end.line, pos.end.character),
      }))

      if (docConfig.underline) {
        editor.setDecorations(NoneDecoration, [])
        editor.setDecorations(UnderlineDecoration, ranges)
      }
      else {
        editor.setDecorations(UnderlineDecoration, [])
        editor.setDecorations(NoneDecoration, ranges)
      }
    }
    catch (err) {
      console.error('[Decorations] Error:', err)
      reset(editor)
    }
  }

  function reset(editor?: TextEditor) {
    if (editor) {
      editor.setDecorations(UnderlineDecoration, [])
      editor.setDecorations(NoneDecoration, [])
    }
  }

  const throttledUpdate = throttle(updateDecorations, 200)

  context.subscriptions.push(
    config.watchChanged(
      ['underline', 'colorPreview', 'remToPxPreview', 'remToPxRatio'],
      () => {
        updateDecorations(window.activeTextEditor)
      },
    ),
  )

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(updateDecorations),
  )

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((e) => {
      if (e.document === window.activeTextEditor?.document)
        throttledUpdate()
    }),
  )

  context.subscriptions.push(UnderlineDecoration)
  context.subscriptions.push(NoneDecoration)

  updateDecorations()

  // Return the update function so it can be called externally (e.g., after config reload)
  return {
    updateDecorations,
    reset,
  }
}
