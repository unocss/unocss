import { fileURLToPath } from 'node:url'
import type { DecorationOptions } from 'vscode'
import { DecorationRangeBehavior, Range, window } from 'vscode'
import type { AnnotationEventParams } from './types'
import { getMarkdown } from './utils'
import { log } from './log'

export function createAnnotationHandler() {
  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const NoneDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const colorDecoration = window.createTextEditorDecorationType({
    before: {
      width: '0.9em',
      height: '0.9em',
      contentText: ' ',
      border: '1px solid',
      margin: 'auto 0.2em auto 0;vertical-align: middle;border-radius:50%;',
    },
    dark: {
      before: {
        borderColor: '#eeeeee50',
      },
    },
    light: {
      before: {
        borderColor: '#00000050',
      },
    },
  })

  const reset = () => {
    const editor = window.activeTextEditor
    if (editor) {
      editor.setDecorations(UnderlineDecoration, [])
      editor.setDecorations(NoneDecoration, [])
      editor.setDecorations(colorDecoration, [])
    }
  }

  return (params: AnnotationEventParams) => {
    const editor = window.activeTextEditor
    if (!editor)
      return
    if (params.uri === null) {
      reset()
      log.appendLine(`⚠️ ${params.reason}`)
      return
    }
    const fsPath = fileURLToPath(params.uri)
    const doc = editor.document
    if (doc.uri.fsPath !== fsPath) {
      reset()
      return
    }
    const colorRanges = params.annotations.map<DecorationOptions>((r) => {
      const [start, end, css] = r
      return {
        range: new Range(doc.positionAt(start), doc.positionAt(end)),
        get hoverMessage() {
          return getMarkdown(css, 'css')
        },
      }
    })
    if (params.underline) {
      editor.setDecorations(UnderlineDecoration, colorRanges)
      editor.setDecorations(NoneDecoration, [])
    }
    else {
      editor.setDecorations(UnderlineDecoration, [])
      editor.setDecorations(NoneDecoration, colorRanges)
    }
  }
}
