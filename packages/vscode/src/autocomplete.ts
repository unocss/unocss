import type { UnocssAutocomplete } from '@unocss/autocomplete'
import type { UnocssPluginContext, UnoGenerator } from '@unocss/core'
import type { CompletionItemProvider, Disposable, ExtensionContext } from 'vscode'
import type { ContextLoader } from './contextLoader'
import { createAutocomplete } from '@unocss/autocomplete'
import { CompletionItem, CompletionItemKind, CompletionList, languages, MarkdownString, Range, window } from 'vscode'
import { getLanguageIds, useConfigurations } from './configuration'
import { delimiters } from './constants'
import { isCssId } from './integration'
import { log } from './log'
import { getColorString, getCSS, getPrettiedCSS, getPrettiedMarkdown, shouldProvideAutocomplete } from './utils'

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
  contextLoader: ContextLoader,
  ext: ExtensionContext,
) {
  const autoCompletes = new Map<UnocssPluginContext, UnocssAutocomplete>()
  const { configuration, watchChanged, disposable } = useConfigurations(ext)

  contextLoader.events.on('contextReload', (ctx) => {
    autoCompletes.delete(ctx)
  })

  contextLoader.events.on('contextUnload', (ctx) => {
    autoCompletes.delete(ctx)
  })

  contextLoader.events.on('unload', (ctx) => {
    autoCompletes.delete(ctx)
    disposable.dispose()
  })

  function getAutocomplete(ctx: UnocssPluginContext) {
    const cached = autoCompletes.get(ctx)
    if (cached)
      return cached

    const autocomplete = createAutocomplete(ctx.uno, {
      matchType: configuration.matchType,
    })

    autoCompletes.set(ctx, autocomplete)
    return autocomplete
  }

  async function getMarkdown(uno: UnoGenerator, util: string, remToPxRatio: number) {
    return new MarkdownString(await getPrettiedMarkdown(uno, util, remToPxRatio))
  }

  const provider: CompletionItemProvider<UnoCompletionItem> = {
    async provideCompletionItems(doc, position) {
      const id = doc.uri.fsPath
      if (!contextLoader.isTarget(id))
        return null

      const code = doc.getText()
      if (!code)
        return null

      const offset = window.activeTextEditor!.document.offsetAt(position)

      if (configuration.autocompleteStrict && !shouldProvideAutocomplete(code, id, offset))
        return

      const ctx = await contextLoader.resolveClosestContext(code, id)
      if (!ctx)
        return null

      if (!ctx.filter(code, id) && !isCssId(id))
        return null

      try {
        const autoComplete = getAutocomplete(ctx)

        const result = await autoComplete.suggestInFile(code, doc.offsetAt(position))

        if (!result)
          return

        // log.appendLine(`🤖 ${id} | ${result.suggestions.slice(0, 10).map(v => `[${v[0]}, ${v[1]}]`).join(', ')}`)

        if (!result.suggestions.length)
          return

        const completionItems: UnoCompletionItem[] = []

        const suggestions = result.suggestions.slice(0, configuration.maxItems)
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
      const remToPxRatio = configuration.remToPxRatio ? configuration.remToPxRatio : -1
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

  ext.subscriptions.push(
    watchChanged(['languagesIds'], async () => {
      ext.subscriptions.push(
        await registerProvider(),
      )
    }),

    watchChanged([
      'matchType',
      'maxItems',
      'remToPxRatio',
      'remToPxPreview',
    ], () => {
      autoCompletes.clear()
    }),

    await registerProvider(),
  )
}
