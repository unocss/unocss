import type { UnocssPluginContext } from '@unocss/core'
import { createAutocomplete, searchUsageBoundary } from '@unocss/autocomplete'
import type { CompletionItemProvider, ExtensionContext, TextDocument } from 'vscode'
import { CompletionItem, CompletionItemKind, MarkdownString, Position, Range, languages } from 'vscode'
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

      const line = doc.getText(new Range(new Position(position.line, 0), new Position(position.line, Infinity)))
      const { content: input } = searchUsageBoundary(line, position.character)

      try {
        const suggestions = await autoComplete.suggest(input)

        log.appendLine(`[autocomplete] ${id} | ${input} | ${suggestions.slice(0, 10).join(', ')}`)

        if (!suggestions.length)
          return

        return suggestions.map(i => new CompletionItem(i, CompletionItemKind.EnumMember))
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
