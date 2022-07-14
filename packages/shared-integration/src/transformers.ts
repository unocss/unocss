import type { SourceCodeTransformerEnforce, UnocssPluginContext } from '@unocss/core'
import MagicString from 'magic-string'
import type { EncodedSourceMap } from '@ampproject/remapping'
import remapping from '@ampproject/remapping'
import type { SourceMap } from 'rollup'
import { IGNORE_COMMENT } from './constants'

export async function applyTransformers(
  ctx: UnocssPluginContext,
  original: string,
  id: string,
  enforce: SourceCodeTransformerEnforce = 'default',
) {
  if (original.includes(IGNORE_COMMENT))
    return

  const transformers = (ctx.uno.config.transformers || []).filter(i => (i.enforce || 'default') === enforce)
  if (!transformers.length)
    return

  let code = original
  let s = new MagicString(code)
  const maps: EncodedSourceMap[] = []
  for (const t of transformers) {
    if (t.idFilter) {
      if (!t.idFilter(id))
        continue
    }
    else if (!ctx.filter(code, id)) {
      continue
    }
    await t.transform(s, id, ctx)
    if (s.hasChanged()) {
      code = s.toString()
      maps.push(s.generateMap({ hires: true, source: id }) as EncodedSourceMap)
      s = new MagicString(code)
    }
  }

  if (code !== original) {
    ctx.affectedModules.add(id)
    return {
      code,
      map: remapping(maps, () => null) as SourceMap,
    }
  }
}
