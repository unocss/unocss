import { fileURLToPath } from 'node:url'
import type { UnocssAutocomplete } from '@unocss/autocomplete'
import { createAutocomplete } from '@unocss/autocomplete'
import type { UnocssPluginContext } from '@unocss/core'
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver'
import { getCSS, getColorString } from './utils'
import { isCssId } from './integration'
import type { LanguageServiceContext } from './types'

export function registerAutoComplete(serviceContext: LanguageServiceContext) {
  const { contextLoader, configuration, watchConfigChanged, getDocument, logger, connection, disposables } = serviceContext

  const autoCompletes = new Map<UnocssPluginContext, UnocssAutocomplete>()

  contextLoader.events.on('contextReload', (ctx) => {
    autoCompletes.delete(ctx)
  })
  contextLoader.events.on('contextUnload', (ctx) => {
    autoCompletes.delete(ctx)
  })

  function getAutocomplete(ctx: UnocssPluginContext) {
    const cached = autoCompletes.get(ctx)
    if (cached)
      return cached

    logger.appendLine(`🤖 Creating autocomplete for ${configuration.matchType}`)
    const autocomplete = createAutocomplete(ctx.uno, {
      matchType: configuration.matchType,
    })

    autoCompletes.set(ctx, autocomplete)
    return autocomplete
  }

  disposables.push(connection.onCompletion(async (params) => {
    const textDocument = params.textDocument
    const position = params.position
    const doc = getDocument(textDocument.uri)
    if (!doc)
      return null
    const id = fileURLToPath(textDocument.uri)
    const code = doc.getText()
    if (!code)
      return null
    let ctx = await contextLoader.resolveContext(code, id)
    if (!ctx)
      ctx = await contextLoader.resolveClosestContext(code, id)

    if (!ctx.filter(code, id) && !isCssId(id))
      return null

    try {
      const autoComplete = getAutocomplete(ctx)

      const result = await autoComplete.suggestInFile(code, doc.offsetAt(position))

      //      logger.appendLine(`🤖 ${id} | ${result.suggestions.slice(0, 10).map(v => `[${v[0]}, ${v[1]}]`).join(', ')}`)

      if (!result.suggestions.length)
        return

      const completionItems: CompletionItem[] = []

      const suggestions = result.suggestions.slice(0, configuration.maxItems)

      for (const [value, label] of suggestions) {
        const css = await getCSS(ctx!.uno, value)
        const colorString = getColorString(css)
        const itemKind = colorString ? CompletionItemKind.Color : CompletionItemKind.EnumMember
        const item = CompletionItem.create(label)
        item.kind = itemKind

        const resolved = result.resolveReplacement(value)

        item.insertText = resolved.replacement
        // item.range = new Range(doc.positionAt(resolved.start), doc.positionAt(resolved.end))

        if (colorString) {
          item.documentation = colorString
          item.sortText = /-\d$/.test(label) ? '1' : '2' // reorder color completions
        }
        completionItems.push(item)
      }

      return {
        items: completionItems,
        isIncomplete: true,
      }
    }
    catch (e: any) {
      logger.appendLine('⚠️ Error on getting autocompletion items')
      logger.appendLine(String(e.stack ?? e))
      return null
    }
  }))

  watchConfigChanged([
    'matchType',
    'maxItems',
    'remToPxRatio',
    'remToPxPreview',
  ], () => {
    autoCompletes.clear()
  })
}
