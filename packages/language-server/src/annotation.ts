import { fileURLToPath } from 'node:url'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { AnnotationEventParams, LanguageServiceContext } from './types'
import { INCLUDE_COMMENT_IDE, getMatchedPositionsFromCode, isCssId } from './integration'
import { getPrettiedCSS, throttle } from './utils'
import { log } from './log'

export async function registerAnnotation(
  serviceContext: LanguageServiceContext,
) {
  const { contextLoader, documents, connection, watchConfigChanged, configuration } = serviceContext

  log.appendLine('[annotation] registered')

  const reset = async (reason?: string) => {
    log.appendLine(`[annotation] reset: ${reason}`)
    await connection.sendNotification('unocss/annotation', {
      uri: null,
      annotations: [],
      reason,
    })
  }

  const updateAnnotation = async (doc: TextDocument) => {
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
  }

  connection.onDidChangeTextDocument(throttle(async (e) => {
    const doc = documents.get(e.textDocument.uri)
    if (!doc)
      return
    await updateAnnotation(doc)
  }, 200))

  connection.onNotification('unocss/updateAnnotation', async (uri: string) => {
    const doc = documents.get(uri)
    if (!doc)
      return
    await updateAnnotation(doc)
  })

  watchConfigChanged(['underline', 'remToPxPreview', 'remToPxRatio'], async () => {
    await Promise.all(documents.all().map(updateAnnotation))
  }, { immediate: true })
}
