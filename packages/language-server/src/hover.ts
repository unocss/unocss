import { fileURLToPath } from 'node:url'
import { getMatchedPositionsFromCode } from './integration'
import type { LanguageServiceContext } from './types'
import { getPrettiedCSS } from './utils'

export function registerHover(server: LanguageServiceContext) {
  const { connection, getDocument, contextLoader, configuration } = server

  connection.onHover(async (params) => {
    const uri = params.textDocument.uri
    const pos = params.position
    const doc = getDocument(uri)
    if (!doc)
      return
    const code = doc.getText()
    if (!code)
      return
    const id = fileURLToPath(uri)
    let ctx = await contextLoader.resolveContext(code, id)
    if (!ctx)
      ctx = await contextLoader.resolveClosestContext(code, id)

    const all = await getMatchedPositionsFromCode(ctx.uno, code)

    const offset = doc.offsetAt(pos)

    const matched = all.find(([start, end]) => start <= offset && offset <= end)

    if (matched) {
      const util = matched[2]
      const { prettified } = await getPrettiedCSS(ctx.uno, util, configuration.remToPxRatio)
      return {
        contents: {
          language: 'css',
          value: prettified,
        },
        range: {
          start: doc.positionAt(matched[0]),
          end: doc.positionAt(matched[1]),
        },
      }
    }
    return null
  })
}
