import path from 'path'
import type { DecorationOptions, ExtensionContext, StatusBarItem } from 'vscode'
import { DecorationRangeBehavior, MarkdownString, Range, window, workspace } from 'vscode'
import { INCLUDE_COMMENT_IDE, getMatchedPositions } from './integration'
import { log } from './log'
import { getPrettiedMarkdown, isCssId, throttle } from './utils'
import type { ContextLoader } from './contextLoader'

export async function registerAnnonations(
  cwd: string,
  contextLoader: ContextLoader,
  status: StatusBarItem,
  ext: ExtensionContext,
) {
  let underline: boolean = workspace.getConfiguration().get('unocss.underline') ?? true
  ext.subscriptions.push(workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('unocss.underline')) {
      underline = workspace.getConfiguration().get('unocss.underline') ?? true
      updateAnnotation()
    }
  }))

  workspace.onDidSaveTextDocument(async (doc) => {
    const id = doc.uri.fsPath
    const dir = path.dirname(id)

    if (contextLoader.contextsMap.has(dir)) {
      const ctx = contextLoader.contextsMap.get(dir)!
      try {
        await ctx.reloadConfig()
        log.appendLine(`Config reloaded by ${path.relative(cwd, doc.uri.fsPath)}`)
      }
      catch (e) {
        log.appendLine('Error on loading config')
        log.appendLine(String(e))
      }
    }
  })

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const NoneDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  async function updateAnnotation(editor = window.activeTextEditor) {
    try {
      const doc = editor?.document
      if (!doc)
        return reset()

      const code = doc.getText()
      const id = doc.uri.fsPath

      if (!code)
        return reset()

      let ctx = await contextLoader.resolveContext(code, id)
      if (!ctx && (code.includes(INCLUDE_COMMENT_IDE) || isCssId(id)))
        ctx = await contextLoader.resolveClosestContext(code, id)
      else if (!ctx?.filter(code, id))
        return null

      const result = await ctx.uno.generate(code, { id, preflights: false, minify: true })

      const ranges: DecorationOptions[] = (
        await Promise.all(
          getMatchedPositions(code, Array.from(result.matched))
            .map(async (i): Promise<DecorationOptions> => {
              try {
                const md = await getPrettiedMarkdown(ctx!.uno, i[2])
                return {
                  range: new Range(doc.positionAt(i[0]), doc.positionAt(i[1])),
                  get hoverMessage() {
                    return new MarkdownString(md)
                  },
                }
              }
              catch (e) {
                log.appendLine(`Failed to parse ${i[2]}`)
                log.appendLine(String(e))
                return undefined!
              }
            }),
        )
      ).filter(Boolean)

      if (underline) {
        editor.setDecorations(NoneDecoration, [])
        editor.setDecorations(UnderlineDecoration, ranges)
      }
      else {
        editor.setDecorations(UnderlineDecoration, [])
        editor.setDecorations(NoneDecoration, ranges)
      }

      status.text = `UnoCSS: ${result.matched.size}`
      status.tooltip = new MarkdownString(`${result.matched.size} utilities used in this file`)
      status.show()

      function reset() {
        editor?.setDecorations(UnderlineDecoration, [])
        editor?.setDecorations(NoneDecoration, [])
        status.hide()
      }
    }
    catch (e) {
      log.appendLine('Error on annotation')
      log.appendLine(String(e))
    }
  }

  const throttledUpdateAnnotation = throttle(updateAnnotation, 200)

  window.onDidChangeActiveTextEditor(updateAnnotation)
  workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      throttledUpdateAnnotation()
  })
  contextLoader.events.on('reload', async () => {
    await updateAnnotation()
  })

  await updateAnnotation()
}
