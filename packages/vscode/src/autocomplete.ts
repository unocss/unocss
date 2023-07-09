import type { UnocssAutocomplete } from '@unocss/autocomplete'
import { createAutocomplete } from '@unocss/autocomplete'
import type { CompletionItemProvider, Disposable, ExtensionContext } from 'vscode'
import { CompletionItem, CompletionItemKind, CompletionList, MarkdownString, Range, languages, window } from 'vscode'
import type { UnoGenerator, UnocssPluginContext } from '@unocss/core'
import { getCSS, getColorString, getPrettiedMarkdownByText, isSubdir } from './utils'
import { log } from './log'
import type { ContextLoader } from './contextLoader'
import { isCssId } from './integration'
import { useConfigurations } from './configuration'

const defaultLanguageIds = [
  'erb',
  'haml',
  'hbs',
  'html',
  'css',
  'postcss',
  'javascript',
  'javascriptreact',
  'markdown',
  'ejs',
  'php',
  'svelte',
  'typescript',
  'typescriptreact',
  'vue-html',
  'vue',
  'sass',
  'scss',
  'less',
  'stylus',
  'astro',
  'rust',
]
const delimiters = ['-', ':', ' ', '"', '\'']

class UnoCompletionItem extends CompletionItem {
  uno: UnoGenerator
  value: string
  css: string

  constructor(label: string, kind: CompletionItemKind, value: string, uno: UnoGenerator, css = '') {
    super(label, kind)
    this.uno = uno
    this.value = value
    this.css = css
  }
}

export async function registerAutoComplete(
  cwd: string,
  contextLoader: ContextLoader,
  ext: ExtensionContext,
) {
  const allLanguages = await languages.getLanguages()
  const autoCompletes = new Map<UnocssPluginContext, UnocssAutocomplete>()
  contextLoader.events.on('contextReload', (ctx) => {
    autoCompletes.delete(ctx)
  })
  contextLoader.events.on('contextUnload', (ctx) => {
    autoCompletes.delete(ctx)
  })


  const { configuration, watchChanged } = useConfigurations(ext)

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

  function validateLanguages(targets: string[]) {
    const unValidLanguages: string[] = []
    const validLanguages = targets.filter((language) => {
      if (!allLanguages.includes(language)) {
        unValidLanguages.push(language)
        return false
      }
      return true
    })
    if (unValidLanguages.length)
      window.showWarningMessage(`These language configurations are illegal: ${unValidLanguages.join(',')}`)

    return validLanguages
  }

  const provider: CompletionItemProvider<UnoCompletionItem> = {
    async provideCompletionItems(doc, position) {
      const id = doc.uri.fsPath
      if (!isSubdir(cwd, id))
        return null

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

        log.appendLine(`🤖 ${id} | ${result.suggestions.slice(0, 10).map(v => `[${v[0]}, ${v[1]}]`).join(', ')}`)

        if (!result.suggestions.length)
          return

        const completionItems: UnoCompletionItem[] = []

        const suggestions = result.suggestions.slice(0, configuration.maxItems)

        const time = performance.now()

        for (const [value, label] of suggestions) {
          const resolved = result.resolveReplacement(value)
          const item = new UnoCompletionItem(label, CompletionItemKind.EnumMember, value, ctx!.uno)
          item.range = new Range(doc.positionAt(resolved.start), doc.positionAt(resolved.end))
          item.insertText = resolved.replacement
          completionItems.push(item)
          if (configuration.simpleMode)
            continue
          const css = (await getCSS(ctx.uno, value))
          const colorString = getColorString(css)
          item.kind = colorString ? CompletionItemKind.Color : CompletionItemKind.EnumMember
          item.css = css

          item.range = new Range(doc.positionAt(resolved.start), doc.positionAt(resolved.end))

          if (colorString) {
            item.detail = colorString
            item.sortText = /-\d$/.test(label) ? '1' : '2' // reorder color completions
          }
        }

        log.appendLine(`🤖 suggested by '${result.input}' ${configuration.simpleMode ? 'with simple mode' : ''} | ${performance.now() - time}ms`)

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

  const registerProvider = () => {
    completeUnregister?.dispose?.()

    const validLanguages = validateLanguages(configuration.languagesIds)

    completeUnregister = languages.registerCompletionItemProvider(
      defaultLanguageIds.concat(validLanguages),
      provider,
      ...delimiters,
    )
    return completeUnregister
  }

  watchChanged(['languagesIds'], () => {
    ext.subscriptions.push(
      registerProvider(),
    )
  })

  watchChanged([
    'matchType',
    'maxItems',
    'remToPxRatio',
    'remToPxPreview',
  ], () => {
    autoCompletes.clear()
  })

  ext.subscriptions.push(
    registerProvider(),
  )
}
