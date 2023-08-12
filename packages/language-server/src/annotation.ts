import { fileURLToPath } from 'node:url'
import type { LanguageServiceContext } from './types'
import { INCLUDE_COMMENT_IDE, getMatchedPositionsFromCode, isCssId } from './integration'
import { getPrettiedCSS, throttle } from './utils'

export async function registerAnnotations(
  server: LanguageServiceContext,
) {
  const { contextLoader, getDocument, connection, watchConfigChanged, configuration } = server

  const reset = async (reason?: string) => {
    await connection.sendNotification('unocss/annotation', {
      uri: null,
      annotations: [],
      reason,
    })
  }

  watchConfigChanged(['underline', 'remToPxPreview', 'remToPxRatio'], async () => {
    await reset('config changed')
  })

  connection.onDidChangeTextDocument(throttle(async (event) => {
    const textDocument = event.textDocument
    const doc = getDocument(textDocument.uri)
    if (!doc)
      return
    const code = doc.getText()
    if (!code)
      return reset('empty code')
    const uri = doc.uri
    const id = fileURLToPath(uri)
    let ctx = await contextLoader.resolveContext(code, id)
    if (!ctx)
      ctx = await contextLoader.resolveClosestContext(code, id)

    const isTarget = ctx.filter(code, id) // normal unocss filter
        || code.includes(INCLUDE_COMMENT_IDE) // force include
        || contextLoader.configSources.includes(id) // include config files
        || isCssId(id) // include css files

    if (!isTarget)
      return reset('not target')

    const uno = ctx.uno

    const matched = await getMatchedPositionsFromCode(uno, code)

    const annotations = await Promise.all(matched.map(async (r) => {
      const { prettified } = await getPrettiedCSS(uno, r[2], configuration.remToPxRatio)
      return [r[0], r[1], prettified] as [number, number, string]
    }))

    connection.sendNotification('unocss/annotation', {
      uri,
      annotations,
      underline: configuration.underline,
    })
  }, 200))
}
