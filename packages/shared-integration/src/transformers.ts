import type { SourceCodeTransformerEnforce, UnocssPluginContext } from '@unocss/core'
import MagicString from 'magic-string'
import type { EncodedSourceMap } from '@ampproject/remapping'
import remapping from '@ampproject/remapping'
import { IGNORE_COMMENT, SKIP_COMMENT_RE } from './constants'
import { hash } from './hash'

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
  let s = new MagicString(transformSkipCode(code, skipMap))
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
    ctx.affectedModules.add(id)
    return {
      code,
      map: remapping(maps, (_, ctx) => {
        ctx.content = code
        return null
      }) as any,
    }
  }
}

function transformSkipCode(code: string, map: Map<string, string>) {
  for (const item of Array.from(code.matchAll(SKIP_COMMENT_RE))) {
    if (item != null) {
      const matched = item[0]
      const withHashKey = `@unocss-skip-placeholder-${hash(matched)}`
      map.set(withHashKey, matched)
      code = code.replace(matched, withHashKey)
    }
  }

  return code
}

function restoreSkipCode(code: string, map: Map<string, string>) {
  for (const [withHashKey, matched] of map.entries())
    code = code.replace(withHashKey, matched)

  return code
}
