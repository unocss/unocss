import type { Connection, SemanticTokens, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import type { ServerSettings } from '../types'
import { fileURLToPath } from 'node:url'
import { SemanticTokensBuilder } from 'vscode-languageserver'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { getMatchedPositionsFromDoc } from '../core/cache'

// Single custom token type for every matched utility; clients style it via
// their own semantic-token rules (editor-agnostic vs. VSCode's underline).
// NOTE: some clients only style standard legend types — if so, use 'type'.
export const semanticTokensLegend = {
  tokenTypes: ['unocss'],
  tokenModifiers: [] as string[],
}

export function registerSemanticTokens(
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  getContextManager: () => ContextManager | undefined,
  getSettings: () => ServerSettings,
) {
  connection.languages.semanticTokens.on(async (params): Promise<SemanticTokens> => {
    const empty: SemanticTokens = { data: [] }

    const settings = getSettings()
    if (!settings.semanticTokens)
      return empty

    const contextManager = getContextManager()
    if (!contextManager)
      return empty

    const doc = documents.get(params.textDocument.uri)
    if (!doc)
      return empty

    const id = fileURLToPath(params.textDocument.uri)
    if (!contextManager.isTarget(id))
      return empty

    const code = doc.getText()
    if (!code)
      return empty

    const ctx = await contextManager.resolveClosestContext(code, id)
    if (!ctx)
      return empty

    const isTarget = ctx.filter(code, id)
      || code.includes(INCLUDE_COMMENT_IDE)
      || contextManager.configSources.includes(id)
      || isCssId(id)
    if (!isTarget)
      return empty

    try {
      const positions = await getMatchedPositionsFromDoc(
        ctx.uno,
        code,
        id,
        settings.strictAnnotationMatch,
      )

      // Tokens must be single-line and pushed in non-overlapping order:
      // drop multi-line/empty ranges, then sort.
      const tokens = positions
        .map(([start, end]) => ({
          start: doc.positionAt(start),
          end: doc.positionAt(end),
        }))
        .filter(({ start, end }) => start.line === end.line && end.character > start.character)
        .sort((a, b) => a.start.line - b.start.line || a.start.character - b.start.character)

      const builder = new SemanticTokensBuilder()
      let prevLine = -1
      let prevEnd = -1
      for (const { start, end } of tokens) {
        // Skip tokens starting inside the previous one (overlapping variants).
        if (start.line === prevLine && start.character < prevEnd)
          continue
        builder.push(start.line, start.character, end.character - start.character, 0, 0)
        prevLine = start.line
        prevEnd = end.character
      }
      return builder.build()
    }
    catch (err) {
      connection.console.error(`[unocss] semantic tokens failed: ${err instanceof Error ? err.message : String(err)}`)
      return empty
    }
  })
}
