import { fileURLToPath } from 'node:url'
import type { AnnotationEventParams, LanguageServiceContext } from './types'
import { INCLUDE_COMMENT_IDE, getMatchedPositionsFromCode, isCssId } from './integration'
import { debounce, getPrettiedCSS } from './utils'
import { log } from './log'

export async function registerAnnotation(
  server: LanguageServiceContext,
) {
  const { contextLoader, getDocument, documents, connection, watchConfigChanged, configuration } = server

  const reset = async (reason?: string) => {
    log.appendLine(`[annotation] reset: ${reason}`)
    await connection.sendNotification('unocss/annotation', {
      uri: null,
      annotations: [],
      reason,
    })
  }

  watchConfigChanged(['underline', 'remToPxPreview', 'remToPxRatio'], async () => {

  })

  documents.onDidChangeContent(debounce(async (event) => {
    const doc = event.document
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
      const [start, end, className] = r
      const { prettified: css } = await getPrettiedCSS(uno, className, configuration.remToPxRatio)
      return {
        css,
        range: [start, end] as [number, number],
        className,
      }
    }))

    connection.sendNotification('unocss/annotation', {
      uri,
      annotations,
      underline: configuration.underline,
    } as AnnotationEventParams)
  }, 200))
}
