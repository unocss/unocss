import type { UnocssPluginContext } from '@unocss/core'
import { createAutocomplete, searchUsageBoundary } from '@unocss/autocomplete'
import type { CompletionItemProvider, ExtensionContext, TextDocument } from 'vscode'
import { CompletionItem, CompletionItemKind, Position, Range, languages } from 'vscode'
import { INCLUDE_COMMENT_IDE } from '../../plugins-common/constants'

const languageIds = [
  'javascript',
  'typescript',
  'javascriptreact',
  'typescriptreact',
  'html',
  'vue',
  'svelte',
  'markdown',
]
const delimiters = ['-', ':']

export async function registerAutoComplete(
  context: UnocssPluginContext,
  ext: ExtensionContext,
) {
  const { uno, filter } = context

  const autoComplete = createAutocomplete(uno)

  const provider: CompletionItemProvider = {
    async provideCompletionItems(doc: TextDocument, position: Position) {
      const code = doc.getText()
      const id = doc.uri.fsPath

      if (!code || (!code.includes(INCLUDE_COMMENT_IDE) && !filter(code, id)))
        return null

      const line = doc.getText(new Range(new Position(position.line, 0), new Position(position.line, position.character)))
      const { content: input } = searchUsageBoundary(line, position.character)

      const suggestions = await autoComplete.suggest(input)

      if (!suggestions.length)
        return

      return suggestions.map(i => new CompletionItem(i, CompletionItemKind.Text))
    },

    async resolveCompletionItem(item: CompletionItem) {
      return {
        ...item,
        // documentation: await getCollectionMarkdown(ctx, item.label as string),
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
