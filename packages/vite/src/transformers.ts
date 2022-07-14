import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import MagicString from 'magic-string'
import type { EncodedSourceMap } from '@ampproject/remapping'
import remapping from '@ampproject/remapping'
import type { SourceMap } from 'rollup'
import { IGNORE_COMMENT } from './integration'

export function createTransformerPlugins(ctx: UnocssPluginContext): Plugin[] {
  async function applyTransformers(original: string, id: string, enforce?: 'pre' | 'post') {
    if (original.includes(IGNORE_COMMENT))
      return
    const transformers = (ctx.uno.config.transformers || []).filter(i => i.enforce === enforce)
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

  return [
    {
      name: 'unocss:transformers:default',
      transform(code, id) {
        return applyTransformers(code, id)
      },
      transformIndexHtml(code) {
        return applyTransformers(code, 'index.html')
          .then(t => t?.code)
      },
    },
    {
      name: 'unocss:transformers:pre',
      enforce: 'pre',
      transform(code, id) {
        return applyTransformers(code, id, 'pre')
      },
      transformIndexHtml(code) {
        return applyTransformers(code, 'index.html', 'pre')
          .then(t => t?.code)
      },
    },
    {
      name: 'unocss:transformers:post',
      enforce: 'post',
      transform(code, id) {
        return applyTransformers(code, id, 'post')
      },
      transformIndexHtml(code) {
        applyTransformers(code, 'index.html', 'post')
          .then(t => t?.code)
      },
    },
  ]
}
