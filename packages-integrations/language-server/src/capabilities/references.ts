import type { Connection, Location, ReferenceParams, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ContextManager } from '../core/context'
import type { ServerSettings } from '../types'
import { getMatchedPositionsFromDoc } from '../core/cache'

export function registerReferences(
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  getContextManager: () => ContextManager | undefined,
  _getSettings: () => ServerSettings,
) {
  connection.onReferences(async (params: ReferenceParams): Promise<Location[] | null> => {
    const contextManager = getContextManager()
    if (!contextManager)
      return null

    const doc = documents.get(params.textDocument.uri)
    if (!doc)
      return null

    const id = uriToFsPath(params.textDocument.uri)
    const code = doc.getText()
    const ctx = await contextManager.resolveClosestContext(code, id)
    if (!ctx || !ctx.filter(code, id))
      return null

    const positions = await getMatchedPositionsFromDoc(ctx.uno, code, id)
    const offset = doc.offsetAt(params.position)
    const matched = positions.find(i => i[0] <= offset && i[1] >= offset)

    if (!matched || !matched[2])
      return null

    const name = matched[2]

    const names = new Set(ctx.uno.getCachedAliases(name) ?? [name])

    return positions
      .filter(i => names.has(i[2]))
      .map(i => ({
        uri: params.textDocument.uri,
        range: {
          start: doc.positionAt(i[0]),
          end: doc.positionAt(i[1]),
        },
      }))
  })
}

function uriToFsPath(uri: string): string {
  try {
    const url = new URL(uri)
    return decodeURIComponent(url.pathname.replace(/^\/([a-z]:)/i, '$1'))
  }
  catch {
    return uri
  }
}
