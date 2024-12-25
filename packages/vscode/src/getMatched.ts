import type { UnoGenerator } from '@unocss/core'
import { getMatchedPositionsFromCode } from '@unocss/shared-common'
import { defaultIdeMatchExclude, defaultIdeMatchInclude } from '@unocss/shared-integration'
import { type ExtensionContext, type TextDocument, workspace } from 'vscode'

const cache = new Map<string, ReturnType<typeof getMatchedPositionsFromCode>>()

export function registerDocumentCacheCleaner(ext: ExtensionContext) {
  ext.subscriptions.push(
    workspace.onDidChangeTextDocument((e) => {
      cache.delete(e.document.uri.fsPath)
    }),
  )
}

export function getMatchedPositionsFromDoc(
  uno: UnoGenerator,
  doc: TextDocument,
  force = false,
) {
  const id = doc.uri.fsPath
  if (force)
    cache.delete(id)

  if (cache.has(id))
    return cache.get(id)!

  const options = workspace.getConfiguration('unocss').get('strictAnnotationMatch')
    ? {
        includeRegex: defaultIdeMatchInclude,
        excludeRegex: defaultIdeMatchExclude,
      }
    : undefined

  const result = getMatchedPositionsFromCode(
    uno,
    doc.getText(),
    id,
    options,
  )

  cache.set(id, result)
  return result
}
