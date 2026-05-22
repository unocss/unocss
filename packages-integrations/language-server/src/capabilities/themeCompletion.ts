import type { CompletionItem, CompletionParams, Connection, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import { fileURLToPath } from 'node:url'
import { CompletionItemKind, InsertTextFormat } from 'vscode-languageserver'

const themeCallRegex = /theme\s*\(\s*(['"])([^'"]*)$/

export function registerThemeCompletion(
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  getContextManager: () => ContextManager | undefined,
) {
  connection.onCompletion(async (params: CompletionParams): Promise<CompletionItem[] | null> => {
    const contextManager = getContextManager()
    if (!contextManager)
      return null

    const doc = documents.get(params.textDocument.uri)
    if (!doc)
      return null

    const code = doc.getText()
    if (!code)
      return null

    const line = doc.getText({
      start: { line: params.position.line, character: 0 },
      end: { line: params.position.line, character: params.position.character },
    })

    const match = line.match(themeCallRegex)
    if (!match)
      return null

    const quoteChar = match[1]
    const prefix = match[2]

    const id = fileURLToPath(params.textDocument.uri)
    const ctx = await contextManager.resolveClosestContext(code, id)
    if (!ctx?.uno?.config?.theme)
      return null

    const theme = ctx.uno.config.theme as Record<string, unknown>
    const suggestions = getThemeSuggestions(theme, prefix)

    if (!suggestions.length)
      return null

    const items: CompletionItem[] = suggestions.map(({ key, value }) => {
      const insertText = `${key + quoteChar})`
      const item: CompletionItem = {
        label: key,
        kind: typeof value === 'string' ? CompletionItemKind.Color : CompletionItemKind.Field,
        insertText,
        insertTextFormat: InsertTextFormat.Snippet,
        filterText: key,
      }

      if (typeof value === 'string') {
        item.detail = value
      }
      else if (typeof value === 'object' && value !== null) {
        item.detail = `[${Object.keys(value as object).join(', ')}]`
      }

      return item
    })

    return items
  })
}

function getThemeSuggestions(
  theme: Record<string, unknown>,
  prefix: string,
): { key: string, value: unknown }[] {
  const parts = prefix ? prefix.split('.') : []
  let current: unknown = theme

  for (const part of parts) {
    if (current && typeof current === 'object' && !Array.isArray(current) && part in current) {
      current = (current as Record<string, unknown>)[part]
    }
    else {
      return []
    }
  }

  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    return []
  }

  return Object.entries(current as Record<string, unknown>).map(([key, value]) => ({
    key: prefix ? `${prefix}.${key}` : key,
    value,
  }))
}
