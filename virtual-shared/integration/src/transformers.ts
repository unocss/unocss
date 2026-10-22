import type { EncodedSourceMap } from '@jridgewell/remapping'
import type { SourceCodeTransformer, SourceCodeTransformerEnforce, UnocssPluginContext } from '@unocss/core'
import remapping from '@jridgewell/remapping'
import MagicString from 'magic-string'
import { IGNORE_COMMENT, SKIP_COMMENT_RE } from './constants'
import { restoreSkipCode, transformSkipCode } from './utils'

type TransformersByEnforce = Record<SourceCodeTransformerEnforce, SourceCodeTransformer[]>

const transformerCache = new WeakMap<SourceCodeTransformer[], TransformersByEnforce>()

function getTransformers(ctx: UnocssPluginContext, enforce: SourceCodeTransformerEnforce) {
  const configured = ctx.uno.config.transformers
  if (!configured?.length)
    return

  let grouped = transformerCache.get(configured)
  if (!grouped) {
    grouped = {
      pre: [],
      default: [],
      post: [],
    }
    for (const transformer of configured)
      grouped[transformer.enforce || 'default'].push(transformer)
    transformerCache.set(configured, grouped)
  }

  return grouped[enforce]
}

export async function applyTransformers(
  ctx: UnocssPluginContext,
  original: string,
  id: string,
  enforce: SourceCodeTransformerEnforce = 'default',
) {
  if (original.includes(IGNORE_COMMENT))
    return

  const transformers = getTransformers(ctx, enforce)
  if (!transformers?.length)
    return

  let code = original
  let skipMap: Map<string, string> | undefined
  let s: MagicString | undefined
  const maps: EncodedSourceMap[] = []

  for (const t of transformers) {
    if (t.idFilter) {
      if (!t.idFilter(id))
        continue
    }
    else if (!ctx.filter(code, id)) {
      continue
    }
    if (t.codeFilter && !t.codeFilter(code, id))
      continue

    if (!s) {
      skipMap = new Map<string, string>()
      s = new MagicString(transformSkipCode(code, skipMap, SKIP_COMMENT_RE, '@unocss-skip-placeholder-'))
    }

    await t.transform(s, id, ctx)
    if (s.hasChanged()) {
      code = restoreSkipCode(s.toString(), skipMap!)
      maps.push(s.generateMap({ hires: true, source: id }) as EncodedSourceMap)
      s = new MagicString(code)
    }
  }

  if (code !== original) {
    // Investigate if this is safe to remove: https://github.com/unocss/unocss/pull/3741
    // ctx.affectedModules.add(id)
    return {
      code,
      map: remapping(maps, (_, ctx) => {
        ctx.content = code
        return null
      }) as any,
    }
  }
}
