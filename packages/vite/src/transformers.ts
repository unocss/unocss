import type { TransformPluginContext } from 'rollup'
import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'

export function initTransformerPlugins(ctx: UnocssPluginContext): Plugin[] {
  async function applyTransformers(c: TransformPluginContext, _code: string, id: string, enforce?: 'pre' | 'post') {
    const transformers = (ctx.uno.config.transformers || []).filter(i => i.enforce === enforce)
    if (!transformers.length)
      return undefined

    let code = _code
    for (const t of transformers) {
      if (t.idFilter) {
        if (!t.idFilter(id))
          continue
      }
      else if (!ctx.filter(code, id)) {
        continue
      }
      const result = (await t.transform(code, id, ctx))
      if (result == null)
        continue
      if (typeof result === 'string') {
        code = result
      }
      else {
        code = result.code
        if (result.map && 'sourcemapChain' in c)
          // @ts-expect-error unexposed types
          c.sourcemapChain.push(result.map)
      }
    }
    if (code === _code)
      return null
    return code
  }

  return [
    {
      name: 'unocss:transformers:deafult',
      transform(code, id) {
        return applyTransformers(this, code, id)
      },
    },
    {
      name: 'unocss:transformers:pre',
      enforce: 'pre',
      transform(code, id) {
        return applyTransformers(this, code, id, 'pre')
      },
    },
    {
      name: 'unocss:transformers:post',
      enforce: 'post',
      transform(code, id) {
        return applyTransformers(this, code, id, 'post')
      },
    },
  ]
}
