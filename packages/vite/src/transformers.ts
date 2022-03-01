import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import MagicString from 'magic-string-extra'

export function initTransformerPlugins(ctx: UnocssPluginContext): Plugin[] {
  async function applyTransformers(code: string, id: string, enforce?: 'pre' | 'post') {
    const transformers = (ctx.uno.config.transformers || []).filter(i => i.enforce === enforce)
    if (!transformers.length)
      return

    const s = new MagicString(code)
    for (const t of transformers) {
      if (t.idFilter) {
        if (!t.idFilter(id))
          continue
      }
      else if (!ctx.filter(code, id)) {
        continue
      }
      await t.transform(s, id, ctx)
    }
    return {
      code: s.toString(),
      map: s.generateMap({ hires: true }),
    }
  }

  return [
    {
      name: 'unocss:transformers:default',
      transform(code, id) {
        return applyTransformers(code, id)
      },
    },
    {
      name: 'unocss:transformers:pre',
      enforce: 'pre',
      transform(code, id) {
        return applyTransformers(code, id, 'pre')
      },
    },
    {
      name: 'unocss:transformers:post',
      enforce: 'post',
      transform(code, id) {
        return applyTransformers(code, id, 'post')
      },
    },
  ]
}
