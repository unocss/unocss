import type { SourceCodeTransformerEnforce, UnocssPluginContext } from '@unocss/core'
import MagicString from 'magic-string'
import type { EncodedSourceMap } from '@ampproject/remapping'
import remapping from '@ampproject/remapping'
import { IGNORE_COMMENT, SKIP_COMMENT_RE } from './constants'
import { restoreSkipCode, transformSkipCode } from './utils'

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

  const skipMap = new Map<string, string>()
  let code = original
  let s = new MagicString(transformSkipCode(code, skipMap, SKIP_COMMENT_RE, '@unocss-skip-placeholder-'))
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
      code = restoreSkipCode(s.toString(), skipMap)
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
