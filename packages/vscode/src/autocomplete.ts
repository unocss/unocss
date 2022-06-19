import type { UnocssAutocomplete } from '@unocss/autocomplete'
import { createAutocomplete } from '@unocss/autocomplete'
import type { CompletionItemProvider, ExtensionContext } from 'vscode'
import { CompletionItem, CompletionItemKind, CompletionList, MarkdownString, Range, languages } from 'vscode'
import type { UnoGenerator, UnocssPluginContext } from '@unocss/core'
import { getPrettiedMarkdown, isCssId } from './utils'
import { log } from './log'
import type { ContextLoader } from './contextLoader'

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
      const code = doc.getText()
      const id = doc.uri.fsPath

      if (!code)
        return null

      let ctx = await contextLoader.resolveContext(code, id)
      if (!ctx)
        ctx = await contextLoader.resolveClosestContext(code, id)
      else if (!ctx.filter(code, id) && !isCssId(id))
        return null

      try {
        const autoComplete = getAutocomplete(ctx)

        const result = await autoComplete.suggestInFile(code, doc.offsetAt(position))

        log.appendLine(`[autocomplete] ${id} | ${result.suggestions.slice(0, 10).map(v => `[${v[0]}, ${v[1]}]`).join(', ')}`)

        if (!result.suggestions.length)
          return

        return new CompletionList(result.suggestions.map(([value, label]) => {
          const resolved = result.resolveReplacement(value)
          const item = new UnoCompletionItem(label, CompletionItemKind.EnumMember, ctx!.uno)
          item.insertText = resolved.replacement
          item.range = new Range(doc.positionAt(resolved.start), doc.positionAt(resolved.end))
          return item
        }), true)
      }
      catch (e) {
        log.appendLine(`[error] ${String(e)}`)
        return null
      }
    },

    async resolveCompletionItem(item) {
      return {
        ...item,
        documentation: await getMarkdown(item.uno, item.label as string),
      }
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
