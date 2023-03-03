import path from 'path'
import type { DecorationOptions, ExtensionContext, StatusBarItem } from 'vscode'
import { DecorationRangeBehavior, MarkdownString, Range, window, workspace } from 'vscode'
import { INCLUDE_COMMENT_IDE, getMatchedPositionsFromCode, isCssId } from './integration'
import { log } from './log'
import { getColorString, getPrettiedMarkdown, isSubdir, throttle } from './utils'
import type { ContextLoader } from './contextLoader'

export async function registerAnnotations(
  cwd: string,
  contextLoader: ContextLoader,
  status: StatusBarItem,
  ext: ExtensionContext,
) {
  let underline: boolean = workspace.getConfiguration().get('unocss.underline') ?? true
  let colorPreview: boolean = workspace.getConfiguration().get('unocss.colorPreview') ?? true
  ext.subscriptions.push(workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('unocss.underline')) {
      underline = workspace.getConfiguration().get('unocss.underline') ?? true
      updateAnnotation()
    }
    if (event.affectsConfiguration('unocss.colorPreview')) {
      colorPreview = workspace.getConfiguration().get('unocss.colorPreview') ?? true
      updateAnnotation()
    }
  }))

  workspace.onDidSaveTextDocument(async (doc) => {
    const id = doc.uri.fsPath
    const dir = path.dirname(id)

    if (contextLoader.contextsMap.has(dir)) {
      const ctx = contextLoader.contextsMap.get(dir)!
      if (!ctx.getConfigFileList().includes(id))
        return
      try {
        await ctx.reloadConfig()
        log.appendLine(`🛠 Config reloaded by ${path.relative(cwd, doc.uri.fsPath)}`)
      }
      catch (e: any) {
        log.appendLine('⚠️ Error on loading config')
        log.appendLine(String(e.stack ?? e))
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

  async function updateAnnotation(editor = window.activeTextEditor) {
    try {
      const doc = editor?.document
      if (!doc)
        return reset()

      const id = doc.uri.fsPath
      if (!isSubdir(cwd, id))
        return reset()

      const code = doc.getText()
      if (!code)
        return reset()

      let ctx = await contextLoader.resolveContext(code, id)
      if (!ctx)
        ctx = await contextLoader.resolveClosestContext(code, id)

      if (!ctx.filter(code, id) && !code.includes(INCLUDE_COMMENT_IDE) && !isCssId(id))
        return reset()

      const result = await ctx.uno.generate(code, { id, preflights: false, minify: true })

      const colorRanges: DecorationOptions[] = []

      const ranges: DecorationOptions[] = (
        await Promise.all(
          (await getMatchedPositionsFromCode(ctx.uno, code))
            .map(async (i): Promise<DecorationOptions> => {
              try {
                const md = await getPrettiedMarkdown(ctx!.uno, i[2])

                if (colorPreview) {
                  const color = getColorString(md)
                  if (color) {
                    colorRanges.push({
                      range: new Range(doc.positionAt(i[0]), doc.positionAt(i[1])),
                      renderOptions: { before: { backgroundColor: color } },
                    })
                  }
                }
                return {
                  range: new Range(doc.positionAt(i[0]), doc.positionAt(i[1])),
                  get hoverMessage() {
                    return new MarkdownString(md)
                  },
                }
              }
              catch (e: any) {
                log.appendLine(`⚠️ Failed to parse ${i[2]}`)
                log.appendLine(String(e.stack ?? e))
                return undefined!
              }
            }),
        )
      ).filter(Boolean)

      editor.setDecorations(colorDecoration, colorRanges)

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
        editor?.setDecorations(colorDecoration, [])
        status.hide()
      }
    }
    catch (e: any) {
      log.appendLine('⚠️ Error on annotation')
      log.appendLine(String(e.stack ?? e))
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
