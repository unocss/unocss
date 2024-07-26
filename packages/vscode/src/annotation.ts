import path from 'path'
import type { DecorationOptions, Disposable, ExtensionContext, StatusBarItem, TextEditor } from 'vscode'
import { DecorationRangeBehavior, MarkdownString, Range, window, workspace } from 'vscode'
import { INCLUDE_COMMENT_IDE, defaultIdeMatchExclude, defaultIdeMatchInclude, getMatchedPositionsFromCode, isCssId } from './integration'
import { log } from './log'
import { getColorString, getPrettiedMarkdown, throttle } from './utils'
import type { ContextLoader } from './contextLoader'
import { useConfigurations } from './configuration'

export async function registerAnnotations(
  contextLoader: ContextLoader,
  status: StatusBarItem,
  ext: ExtensionContext,
) {
  const { configuration, watchChanged, disposable } = useConfigurations(ext)
  const disposals: Disposable[] = []

  watchChanged(['underline', 'colorPreview', 'remToPxPreview', 'remToPxRatio', 'strictAnnotationMatch'], () => {
    updateAnnotation()
  })

  disposals.push(disposable)

  disposals.push(workspace.onDidSaveTextDocument(async (doc) => {
    const id = doc.uri.fsPath
    const dir = path.dirname(id)

    if (contextLoader.contextsMap.has(dir)) {
      const ctx = contextLoader.contextsMap.get(dir)!
      if (!ctx.getConfigFileList().includes(id))
        return
      try {
        await ctx.reloadConfig()
        log.appendLine(`🛠 Config reloaded by ${path.relative(contextLoader.cwd, doc.uri.fsPath)}`)
      }
      catch (e: any) {
        log.appendLine('⚠️ Error on loading config')
        log.appendLine(String(e.stack ?? e))
      }
    }
  }))

  const UnderlineDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed currentColor',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const NoneDecoration = window.createTextEditorDecorationType({
    textDecoration: 'none',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  })

  const borderRadius = configuration.colorPreviewRadius || '50%'
  const colorDecoration = window.createTextEditorDecorationType({
    before: {
      width: '0.9em',
      height: '0.9em',
      contentText: ' ',
      border: '1px solid',
      margin: `auto 0.2em auto 0;vertical-align: middle;border-radius: ${borderRadius};`,
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
        return reset(editor)

      const id = doc.uri.fsPath
      if (!contextLoader.isTarget(id))
        return reset(editor)

      const code = doc.getText()
      if (!code)
        return reset(editor)

      const ctx = await contextLoader.resolveClosestContext(code, id)
      if (!ctx)
        return reset(editor)

      const isTarget = ctx.filter(code, id) // normal unocss filter
        || code.includes(INCLUDE_COMMENT_IDE) // force include
        || contextLoader.configSources.includes(id) // include config files
        || isCssId(id) // include css files

      if (!isTarget)
        return reset(editor)

      const result = await ctx.uno.generate(code, { id, preflights: false, minify: true })

      const colorRanges: DecorationOptions[] = []

      const remToPxRatio = configuration.remToPxPreview
        ? configuration.remToPxRatio
        : -1

      const options = configuration.strictAnnotationMatch
        ? {
            includeRegex: defaultIdeMatchInclude,
            excludeRegex: defaultIdeMatchExclude,
          }
        : undefined

      const positions = await getMatchedPositionsFromCode(ctx.uno, code, id, options)
      const isAttributify = ctx.uno.config.presets.some(i => i.name === '@unocss/preset-attributify')

      const ranges: DecorationOptions[] = (
        await Promise.all(positions.map(async (i): Promise<DecorationOptions> => {
          try {
            const md = await getPrettiedMarkdown(ctx!.uno, isAttributify ? [i[2], `[${i[2]}=""]`] : i[2], remToPxRatio)

            if (configuration.colorPreview) {
              const color = getColorString(md)
              if (color && !colorRanges.find(r => r.range.start.isEqual(doc.positionAt(i[0])))) {
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

      if (configuration.underline) {
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
    }
    catch (e: any) {
      log.appendLine('⚠️ Error on annotation')
      log.appendLine(String(e.stack ?? e))
    }
  }

  function reset(editor?: TextEditor) {
    editor?.setDecorations(UnderlineDecoration, [])
    editor?.setDecorations(NoneDecoration, [])
    editor?.setDecorations(colorDecoration, [])
    status.hide()
  }

  const throttledUpdateAnnotation = throttle(updateAnnotation, 200)

  disposals.push(window.onDidChangeActiveTextEditor(updateAnnotation))
  disposals.push(workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      throttledUpdateAnnotation()
  }))
  contextLoader.events.on('reload', async () => {
    await updateAnnotation()
  })

  contextLoader.events.on('unload', async () => {
    reset(window.activeTextEditor)
    disposals.forEach(disposal => disposal.dispose())
  })

  await updateAnnotation()
}
