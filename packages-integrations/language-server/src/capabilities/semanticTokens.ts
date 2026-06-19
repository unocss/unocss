import type { Connection, SemanticTokens, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import type { ServerSettings } from '../types'
import { fileURLToPath } from 'node:url'
import { SemanticTokensBuilder } from 'vscode-languageserver'
import { INCLUDE_COMMENT_IDE } from '#integration/constants'
import { isCssId } from '#integration/utils'
import { getMatchedPositionsFromDoc } from '../core/cache'

// A single custom token type covers every matched utility. Clients style it
// through their own semantic-token rules (e.g. Zed's
// `global_lsp_settings.semantic_token_rules`), an editor-agnostic equivalent of
// the VSCode-only underline decoration.
//
// NOTE: whether a client honors a *custom* legend type (vs. only the standard
// LSP set) for user styling rules is client-specific. If a client turns out to
// only style standard types, change this to a standard one (e.g. 'type').
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

      // Semantic tokens cannot span multiple lines and must be pushed in
      // strictly increasing, non-overlapping order. Utility class names are
      // always single-line, but variant matches can overlap, so sort and drop
      // overlaps to keep the encoding valid.
      const tokens = positions
        .map(([start, end]) => ({
          start: doc.positionAt(start),
          end: doc.positionAt(end),
        }))
        .filter(({ start, end }) => start.line === end.line && end.character > start.character)
        .sort((a, b) => a.start.line - b.start.line || a.start.character - b.start.character)

      const builder = new SemanticTokensBuilder()
      let prevLine = -1
      let prevChar = -1
      for (const { start, end } of tokens) {
        if (start.line === prevLine && start.character <= prevChar)
          continue
        builder.push(start.line, start.character, end.character - start.character, 0, 0)
        prevLine = start.line
        prevChar = start.character
      }
      return builder.build()
    }
    catch {
      return empty
    }
  })
}
