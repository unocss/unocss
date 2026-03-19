import type { ColorInformation, ColorPresentation, Connection, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import type { ServerSettings } from '../types'
import { fileURLToPath } from 'node:url'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { getMatchedPositionsFromDoc } from '../core/cache'
import { getColorString, parseColorToRGBA } from '../utils/color'
import { getCSS } from '../utils/css'

export function registerColorProvider(
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  getContextManager: () => ContextManager | undefined,
  getSettings: () => ServerSettings,
) {
  connection.onDocumentColor(async (params): Promise<ColorInformation[]> => {
    const settings = getSettings()
    if (!settings.colorPreview)
      return []

    const contextManager = getContextManager()
    if (!contextManager)
      return []

    const doc = documents.get(params.textDocument.uri)
    if (!doc)
      return []

    const id = fileURLToPath(params.textDocument.uri)
    if (!contextManager.isTarget(id))
      return []

    const code = doc.getText()
    if (!code)
      return []

    const ctx = await contextManager.resolveClosestContext(code, id)
    if (!ctx)
      return []

    const isTarget = ctx.filter(code, id)
      || code.includes(INCLUDE_COMMENT_IDE)
      || contextManager.configSources.includes(id)
      || isCssId(id)

    if (!isTarget)
      return []

    const positions = await getMatchedPositionsFromDoc(
      ctx.uno,
      code,
      id,
      settings.strictAnnotationMatch,
    )

    const isAttributify = ctx.uno.config.presets.some(i => i.name === '@unocss/preset-attributify')
    const colors: ColorInformation[] = []

    for (const [start, end, className] of positions) {
      try {
        const css = await getCSS(ctx.uno, isAttributify ? [className, `[${className}=""]`] : className)
        const colorString = getColorString(css)
        if (!colorString)
          continue

        const rgba = parseColorToRGBA(colorString)
        if (!rgba)
          continue

        colors.push({
          range: {
            start: doc.positionAt(start),
            end: doc.positionAt(end),
          },
          color: rgba,
        })
      }
      catch {}
    }

    return colors
  })

  connection.onColorPresentation((params): ColorPresentation[] => {
    const { color } = params
    const r = Math.round(color.red * 255)
    const g = Math.round(color.green * 255)
    const b = Math.round(color.blue * 255)

    return [
      { label: `rgb(${r} ${g} ${b})` },
    ]
  })
}
