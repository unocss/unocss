import type { UnocssPluginContext } from '@unocss/core'
import { createAutocomplete } from '@unocss/autocomplete'
import type { CompletionItemProvider, ExtensionContext, Position, TextDocument } from 'vscode'
import { CompletionItem, CompletionItemKind, CompletionList, MarkdownString, Range, languages } from 'vscode'
import { getPrettiedMarkdown } from './utils'
import { log } from './log'

const languageIds = [
  'erb',
  'haml',
  'hbs',
  'html',
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

export async function registerAutoComplete(
  context: UnocssPluginContext,
  ext: ExtensionContext,
) {
  const { uno, filter } = context

  const autoComplete = createAutocomplete(uno)

  async function getMarkdown(util: string) {
    return new MarkdownString(await getPrettiedMarkdown(uno, util))
  }

  const provider: CompletionItemProvider = {
    async provideCompletionItems(doc: TextDocument, position: Position) {
      const code = doc.getText()
      const id = doc.uri.fsPath

      if (!code || !filter(code, id))
        return null

      try {
        const result = await autoComplete.suggestInFile(code, doc.offsetAt(position))

        log.appendLine(`[autocomplete] ${id} | ${result.suggestions.slice(0, 10).map(v => `[${v[0]}, ${v[1]}]`).join(', ')}`)

        if (!result.suggestions.length)
          return

        return new CompletionList(result.suggestions.map(([value, label]) => {
          const resolved = result.resolveReplacement(value)
          const item = new CompletionItem(label, CompletionItemKind.EnumMember)
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

    async resolveCompletionItem(item: CompletionItem) {
      return {
        ...item,
        documentation: await getMarkdown(item.label as string),
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
