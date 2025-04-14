import type { UnocssAutocomplete } from '@unocss/autocomplete'
import type { SuggestResult, UnocssPluginContext, UnoGenerator } from '@unocss/core'
import type { CompletionItemProvider, Disposable, Position, TextDocument } from 'vscode'
import type { ContextLoader } from './contextLoader'
import { isCssId } from '#integration/utils'
import { createAutocomplete } from '@unocss/autocomplete'
import { CompletionItem, CompletionItemKind, CompletionList, languages, MarkdownString, Range, window } from 'vscode'
import { getConfig, getLanguageIds } from './configs'
import { delimiters } from './constants'
import { log } from './log'
import { getColorString, getCSS, getPrettiedCSS, getPrettiedMarkdown, isVueWithPug, shouldProvideAutocomplete } from './utils'

class UnoCompletionItem extends CompletionItem {
  uno: UnoGenerator
  value: string

  constructor(label: string, kind: CompletionItemKind, value: string, uno: UnoGenerator) {
    super(label, kind)
    this.uno = uno
    this.value = value
  }
}

export async function registerAutoComplete(
  loader: ContextLoader,
) {
  const autoCompletes = new Map<UnocssPluginContext, UnocssAutocomplete>()
  const config = getConfig()
  loader.events.on('contextReload', (ctx) => {
    autoCompletes.delete(ctx)
  })

  loader.events.on('contextUnload', (ctx) => {
    autoCompletes.delete(ctx)
  })

  loader.events.on('unload', (ctx) => {
    autoCompletes.delete(ctx)
  })

  function getAutocomplete(ctx: UnocssPluginContext) {
    const cached = autoCompletes.get(ctx)
    if (cached)
      return cached

    const autocomplete = createAutocomplete(ctx.uno, {
      matchType: config.autocompleteMatchType,
    })

    autoCompletes.set(ctx, autocomplete)
    return autocomplete
  }

  async function getMarkdown(uno: UnoGenerator, util: string, remToPxRatio: number) {
    return new MarkdownString(await getPrettiedMarkdown(uno, util, remToPxRatio))
  }

  async function getSuggestionResult({
    ctx,
    code,
    id,
    doc,
    position,
  }: { ctx: UnocssPluginContext, code: string, id: string, doc: TextDocument, position: Position }) {
    const isPug = isVueWithPug(code, id)
    // If isPug is true, then we should not recognize it as a cssId.
    if (!ctx.filter(code, id) && !isCssId(id) && !isPug)
      return null

    try {
      const autoComplete = getAutocomplete(ctx)

      const cursorPosition = doc.offsetAt(position)
      let result: SuggestResult | undefined

      // Special treatment for Pug Vue templates
      if (isPug) {
      // get content from cursorPosition
        const textBeforeCursor = code.substring(0, cursorPosition)
        // check the dot
        const dotMatch = textBeforeCursor.match(/\.[-\w]*$/)

        if (dotMatch) {
          const matched = dotMatch[0].substring(1) // replace dot
          const suggestions = await autoComplete.suggest(matched || '')

          if (suggestions.length) {
            result = {
              suggestions: suggestions.map(v => [v, v] as [string, string]),
              resolveReplacement: (suggestion: string) => ({
                start: cursorPosition - (matched?.length || 0),
                end: cursorPosition,
                replacement: suggestion,
              }),
            }
          }
        }
        else {
        // original logic
          result = await autoComplete.suggestInFile(code, cursorPosition)
        }
      }
      else {
        result = await autoComplete.suggestInFile(code, cursorPosition)
      }

      return result
    }
    catch (e: any) {
      throw new Error(e)
    }
  }

  const provider: CompletionItemProvider<UnoCompletionItem> = {
    async provideCompletionItems(doc, position) {
      const id = doc.uri.fsPath
      if (!loader.isTarget(id))
        return null

      const ctx = await loader.resolveClosestContext(doc.getText(), id)
      if (!ctx)
        return null

      const offset = window.activeTextEditor!.document.offsetAt(position)

      const code = doc.getText()
      if (!code)
        return null

      if (config.autocompleteStrict && !shouldProvideAutocomplete(code, id, offset))
        return

      try {
        const result = await getSuggestionResult({
          ctx,
          code,
          id,
          doc,
          position,
        })

        if (!result)
          return

        // log.appendLine(`🤖 ${id} | ${result.suggestions.slice(0, 10).map(v => `[${v[0]}, ${v[1]}]`).join(', ')}`)

        if (!result.suggestions.length)
          return

        const completionItems: UnoCompletionItem[] = []

        const suggestions = result.suggestions.slice(0, config.autocompleteMaxItems)
        const isAttributify = ctx.uno.config.presets.some(p => p.name === '@unocss/preset-attributify')
        for (const [value, label] of suggestions) {
          const css = await getCSS(ctx!.uno, isAttributify ? [value, `[${value}=""]`] : value)
          const colorString = getColorString(css)
          const itemKind = colorString ? CompletionItemKind.Color : CompletionItemKind.EnumMember
          const item = new UnoCompletionItem(label, itemKind, value, ctx!.uno)
          const resolved = result.resolveReplacement(value)

          item.insertText = resolved.replacement
          item.range = new Range(doc.positionAt(resolved.start), doc.positionAt(resolved.end))

          if (colorString) {
            item.documentation = colorString
            item.sortText = /-\d$/.test(label) ? '1' : '2' // reorder color completions
          }
          completionItems.push(item)
        }

        return new CompletionList(completionItems, true)
      }
      catch (e: any) {
        log.appendLine('⚠️ Error on getting autocompletion items')
        log.appendLine(String(e.stack ?? e))
        return null
      }
    },

    async resolveCompletionItem(item) {
      const remToPxRatio = config.remToPxPreview
        ? config.remToPxRatio
        : -1

      if (item.kind === CompletionItemKind.Color)
        item.detail = await (await getPrettiedCSS(item.uno, item.value, remToPxRatio)).prettified
      else
        item.documentation = await getMarkdown(item.uno, item.value, remToPxRatio)
      return item
    },
  }

  let completeUnregister: Disposable

  const registerProvider = async () => {
    completeUnregister?.dispose?.()

    completeUnregister = languages.registerCompletionItemProvider(
      await getLanguageIds(),
      provider,
      ...delimiters,
    )
    return completeUnregister
  }

  loader.ext.subscriptions.push(
    config.watchChanged(
      ['languageIds'],
      async () => {
        loader.ext.subscriptions.push(
          await registerProvider(),
        )
      },
    ),

    config.watchChanged(
      [
        'autocompleteMatchType',
        'autocompleteStrict',
        'remToPxRatio',
        'remToPxPreview',
      ],
      () => {
        autoCompletes.clear()
      },
    ),

    await registerProvider(),
  )
}
