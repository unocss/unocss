import type { DecorationOptions, Disposable, TextEditor } from 'vscode'
import type { ContextLoader } from './contextLoader'
import path from 'path'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { DecorationRangeBehavior, MarkdownString, Range, window, workspace } from 'vscode'
import { getConfig } from './configs'
import { CssVarsIntelliSenseService } from './css-vars-intellisense'
import { getMatchedPositionsFromDoc } from './getMatched'
import { log } from './log'
import { getColorString, getPrettiedMarkdown, throttle } from './utils'

export async function registerAnnotations(
  loader: ContextLoader,
) {
  const config = getConfig()
  const disposals: Disposable[] = []

  disposals.push(
    config.watchChanged(
      ['underline', 'colorPreview', 'remToPxPreview', 'remToPxRatio'],
      () => {
        updateAnnotation()
      },
    ),
  )

  disposals.push(workspace.onDidSaveTextDocument(async (doc) => {
    const id = doc.uri.fsPath
    const dir = path.dirname(id)

    if (loader.contextsMap.has(dir)) {
      const ctx = loader.contextsMap.get(dir)!
      if (!ctx.getConfigFileList().includes(id))
        return
      try {
        await ctx.reloadConfig()
        log.appendLine(`🛠 Config reloaded by ${path.relative(loader.cwd, doc.uri.fsPath)}`)
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

  const borderRadius = config.colorPreviewRadius || '50%'
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
      if (!loader.isTarget(id))
        return reset(editor)

      const code = doc.getText()
      if (!code)
        return reset(editor)

      const ctx = await loader.resolveClosestContext(code, id)
      if (!ctx)
        return reset(editor)

      const isTarget = ctx.filter(code, id) // normal unocss filter
        || code.includes(INCLUDE_COMMENT_IDE) // force include
        || loader.configSources.includes(id) // include config files
        || isCssId(id) // include css files

      if (!isTarget)
        return reset(editor)

      const docConfig = getConfig(doc)

      const result = await ctx.uno.generate(code, { id, preflights: false, minify: true })

      const colorRanges: DecorationOptions[] = []

      const remToPxRatio = docConfig.remToPxPreview
        ? docConfig.remToPxRatio
        : -1

      const positions = await getMatchedPositionsFromDoc(ctx.uno, doc)
      const isAttributify = ctx.uno.config.presets.some(i => i.name === '@unocss/preset-attributify')

      const service = CssVarsIntelliSenseService.isAvailable(ctx.uno)
        ? new CssVarsIntelliSenseService(ctx.uno, remToPxRatio)
        : null

      const ranges: DecorationOptions[] = (
        await Promise.all(positions.map(async (i): Promise<DecorationOptions | undefined> => {
          try {
            const util = i[2]
            const range = new Range(doc.positionAt(i[0]), doc.positionAt(i[1]))

            let md: MarkdownString | null

            if (service) {
              md = await service.getHoverTooltip(util)
              if (docConfig.colorPreview) {
                const colorInfo = await service.getColorInfo(util)
                if (colorInfo) {
                  colorRanges.push({
                    range,
                    renderOptions: { before: { backgroundColor: colorInfo.hex } },
                  })
                }
              }
            }
            else {
              md = new MarkdownString(await getPrettiedMarkdown(ctx.uno, isAttributify ? [util, `[${util}=""]`] : util, remToPxRatio))
              if (docConfig.colorPreview) {
                const color = getColorString(md.value)
                if (color) {
                  colorRanges.push({
                    range,
                    renderOptions: { before: { backgroundColor: color } },
                  })
                }
              }
            }

            if (!md)
              return undefined

            return {
              range,
              hoverMessage: md,
            }
          }
          catch (e: any) {
            log.appendLine(`⚠️ Failed to parse ${i[2]}`)
            log.appendLine(String(e.stack ?? e))
            return undefined
          }
        }),
        )
      ).filter(Boolean) as DecorationOptions[]

      editor.setDecorations(colorDecoration, colorRanges)

      if (docConfig.underline) {
        editor.setDecorations(NoneDecoration, [])
        editor.setDecorations(UnderlineDecoration, ranges)
      }
      else {
        editor.setDecorations(UnderlineDecoration, [])
        editor.setDecorations(NoneDecoration, ranges)
      }

      loader.status.text = `UnoCSS: ${result.matched.size}`
      loader.status.tooltip = new MarkdownString(`${result.matched.size} utilities used in this file`)
      loader.status.show()
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
    loader.status.hide()
  }

  const throttledUpdateAnnotation = throttle(updateAnnotation, 200)

  disposals.push(window.onDidChangeActiveTextEditor(updateAnnotation))
  disposals.push(workspace.onDidChangeTextDocument((e) => {
    if (e.document === window.activeTextEditor?.document)
      throttledUpdateAnnotation()
  }))
  loader.events.on('reload', async () => {
    await updateAnnotation()
  })

  loader.events.on('unload', async () => {
    reset(window.activeTextEditor)
    disposals.forEach(disposal => disposal.dispose())
  })

  await updateAnnotation()
}
