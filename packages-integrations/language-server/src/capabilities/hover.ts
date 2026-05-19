import type { Connection, Hover, HoverParams, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import type { ServerSettings } from '../types'
import { fileURLToPath } from 'node:url'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { getMatchedPositionsFromDoc } from '../core/cache'
import { getPrettiedMarkdown } from '../utils/css'

export function registerHover(
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  getContextManager: () => ContextManager | undefined,
  getSettings: () => ServerSettings,
) {
  connection.onHover(async (params: HoverParams): Promise<Hover | null> => {
    const settings = getSettings()
    const contextManager = getContextManager()
    if (!contextManager)
      return null

    const doc = documents.get(params.textDocument.uri)
    if (!doc)
      return null

    const id = fileURLToPath(params.textDocument.uri)
    if (!contextManager.isTarget(id))
      return null

    const code = doc.getText()
    if (!code)
      return null

    const ctx = await contextManager.resolveClosestContext(code, id)
    if (!ctx)
      return null

    const isTarget = ctx.filter(code, id)
      || code.includes(INCLUDE_COMMENT_IDE)
      || contextManager.configSources.includes(id)
      || isCssId(id)

    if (!isTarget)
      return null

    const offset = doc.offsetAt(params.position)
    const positions = await getMatchedPositionsFromDoc(
      ctx.uno,
      code,
      id,
      settings.strictAnnotationMatch,
    )

    const matched = positions.find(
      ([start, end]) => offset >= start && offset <= end,
    )

    if (!matched)
      return null

    const isAttributify = ctx.uno.config.presets.some(i => i.name === '@unocss/preset-attributify')
    const remToPxRatio = settings.remToPxPreview ? settings.remToPxRatio : -1

    try {
      const md = await getPrettiedMarkdown(
        ctx.uno,
        isAttributify ? [matched[2], `[${matched[2]}=""]`] : matched[2],
        remToPxRatio,
      )

      return {
        contents: {
          kind: 'markdown',
          value: md,
        },
        range: {
          start: doc.positionAt(matched[0]),
          end: doc.positionAt(matched[1]),
        },
      }
    }
    catch {
      return null
    }
  })
}
