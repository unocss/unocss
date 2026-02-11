import type { UnocssAutocomplete } from '@unocss/autocomplete'
import type { SuggestResult, UnocssPluginContext, UserConfig } from '@unocss/core'
import type { CompletionItem, CompletionParams, Connection, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import type { ServerSettings } from '../types'
import { fileURLToPath } from 'node:url'
import { isCssId } from '#integration/utils'
import { createAutocomplete } from '@unocss/autocomplete'
import { CompletionItemKind } from 'vscode-languageserver'
import { getColorString } from '../utils/color'
import { getCSS, getPrettiedCSS, getPrettiedMarkdown } from '../utils/css'
import { isVueWithPug, shouldProvideAutocomplete } from '../utils/position'

const autoCompletes = new Map<UnocssPluginContext, UnocssAutocomplete>()

function getAutocomplete(ctx: UnocssPluginContext, matchType: 'prefix' | 'fuzzy') {
  const cached = autoCompletes.get(ctx)
  if (cached)
    return cached

  const autocomplete = createAutocomplete(ctx.uno, {
    matchType,
    throwErrors: false,
  })

  autoCompletes.set(ctx, autocomplete)
  return autocomplete
}

export function resetAutoCompleteCache(ctx?: UnocssPluginContext<UserConfig<any>>) {
  if (ctx)
    autoCompletes.delete(ctx)
  else
    autoCompletes.clear()
}

async function getSuggestionResult({
  ctx,
  code,
  id,
  offset,
  matchType,
}: {
  ctx: UnocssPluginContext
  code: string
  id: string
  offset: number
  matchType: 'prefix' | 'fuzzy'
}) {
  const isPug = isVueWithPug(code, id)
  if (!ctx.filter(code, id) && !isCssId(id) && !isPug)
    return null

  const autoComplete = getAutocomplete(ctx, matchType)

  let result: SuggestResult | undefined

  if (isPug) {
    const textBeforeCursor = code.substring(0, offset)
    const dotMatch = textBeforeCursor.match(/\.[-\w]*$/)

    if (dotMatch) {
      const matched = dotMatch[0].substring(1)
      const suggestions = await autoComplete.suggest(matched || '')

      if (suggestions.length) {
        result = {
          suggestions: suggestions.map(v => [v, v] as [string, string]),
          resolveReplacement: (suggestion: string) => ({
            start: offset - (matched?.length || 0),
            end: offset,
            replacement: suggestion,
          }),
        }
      }
    }
    else {
      result = await autoComplete.suggestInFile(code, offset)
    }
  }
  else {
    result = await autoComplete.suggestInFile(code, offset)
  }

  return result
}

export function registerCompletion(
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  getContextManager: () => ContextManager | undefined,
  getSettings: () => ServerSettings,
) {
  connection.onCompletion(async (params: CompletionParams) => {
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

    const offset = doc.offsetAt(params.position)

    if (settings.autocompleteStrict && !shouldProvideAutocomplete(code, id, offset))
      return null

    try {
      const result = await getSuggestionResult({
        ctx,
        code,
        id,
        offset,
        matchType: settings.autocompleteMatchType,
      })

      if (!result || !result.suggestions.length)
        return null

      const isAttributify = ctx.uno.config.presets.some(p => p.name === '@unocss/preset-attributify')
      const suggestions = result.suggestions.slice(0, settings.autocompleteMaxItems)

      const items: CompletionItem[] = []
      for (let i = 0; i < suggestions.length; i++) {
        const [value, label] = suggestions[i]
        const css = await getCSS(ctx.uno, isAttributify ? [value, `[${value}=""]`] : value)
        const colorString = getColorString(css)
        const resolved = result.resolveReplacement(value)

        const item: CompletionItem = {
          label,
          kind: colorString ? CompletionItemKind.Color : CompletionItemKind.EnumMember,
          sortText: colorString ? (/-\d$/.test(label) ? '1' : '2') : undefined,
          data: {
            value,
            uri: params.textDocument.uri,
          },
          textEdit: {
            range: {
              start: doc.positionAt(resolved.start),
              end: doc.positionAt(resolved.end),
            },
            newText: resolved.replacement,
          },
        }

        if (colorString) {
          item.documentation = colorString
        }

        items.push(item)
      }

      return {
        isIncomplete: true,
        items,
      }
    }
    catch {
      return null
    }
  })

  connection.onCompletionResolve(async (item: CompletionItem) => {
    if (!item.data?.uri || !item.data?.value)
      return item

    const settings = getSettings()
    const contextManager = getContextManager()
    if (!contextManager)
      return item

    const id = fileURLToPath(item.data.uri)
    const doc = documents.get(item.data.uri)
    if (!doc)
      return item

    const code = doc.getText()
    const ctx = await contextManager.resolveClosestContext(code, id)
    if (!ctx)
      return item

    const remToPxRatio = settings.remToPxPreview ? settings.remToPxRatio : -1

    if (item.kind === CompletionItemKind.Color) {
      item.detail = await (await getPrettiedCSS(ctx.uno, item.data.value, remToPxRatio)).prettified
    }
    else {
      item.documentation = {
        kind: 'markdown',
        value: await getPrettiedMarkdown(ctx.uno, item.data.value, remToPxRatio),
      }
    }

    return item
  })
}
