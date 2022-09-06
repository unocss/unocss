import type { UnocssAutocomplete } from '@unocss/autocomplete'
import { createAutocomplete } from '@unocss/autocomplete'
import type { CompletionItemProvider, ExtensionContext } from 'vscode'
import { CompletionItem, CompletionItemKind, CompletionList, MarkdownString, Range, languages } from 'vscode'
import type { UnoGenerator, UnocssPluginContext } from '@unocss/core'
import { body2ColorValue, getPrettiedCSS, getPrettiedMarkdown, isSubdir } from './utils'
import { log } from './log'
import type { ContextLoader } from './contextLoader'
import { isCssId } from './integration'

const languageIds = [
  'erb',
  'haml',
  'hbs',
  'html',
  'css',
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
]
const delimiters = ['-', ':']

class UnoCompletionItem extends CompletionItem {
  uno: UnoGenerator

  constructor(label: string, kind: CompletionItemKind, uno: UnoGenerator) {
    super(label, kind)
    this.uno = uno
  }
}

export async function registerAutoComplete(
  cwd: string,
  contextLoader: ContextLoader,
  ext: ExtensionContext,
) {
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

    const autocomplete = createAutocomplete(ctx.uno)

    autoCompletes.set(ctx, autocomplete)
    return autocomplete
  }

  async function getMarkdown(uno: UnoGenerator, util: string) {
    return new MarkdownString(await getPrettiedMarkdown(uno, util))
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

        const theme = ctx?.uno.config.theme
        return new CompletionList(result.suggestions.map(([value, label]) => {
          const colorValue = theme ? body2ColorValue(value, theme) : null
          const itemKind = colorValue?.color ? CompletionItemKind.Color : CompletionItemKind.EnumMember

          const resolved = result.resolveReplacement(value)
          const item = new UnoCompletionItem(label, itemKind, ctx!.uno)
          item.insertText = resolved.replacement
          item.range = new Range(doc.positionAt(resolved.start), doc.positionAt(resolved.end))

          if (colorValue?.color) {
            item.documentation = colorValue?.color
            item.sortText = /-\d$/.test(label) ? '1' : '2' // reorder color completions
          }

          return item
        }), true)
      }
      catch (e) {
        log.appendLine(`⚠️ ${String(e)}`)
        return null
      }
    },

    async resolveCompletionItem(item) {
      if (item.kind === CompletionItemKind.Color)
        item.detail = await (await getPrettiedCSS(item.uno, item.label as string)).prettified
      else
        item.documentation = await getMarkdown(item.uno, item.label as string)
      return item
    },
  }

  ext.subscriptions.push(
    languages.registerCompletionItemProvider(
      languageIds,
      provider,
      ...delimiters,
    ),
  )
}
