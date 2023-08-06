import type { Plugin } from 'vite'
import { type PluginOptions, type UnocssPluginContext, cssIdRE } from '@unocss/core'
import type { SvelteScopedContext } from '../preprocess'
import { applyTransformers } from '../../../shared-integration/src/transformers'

const svelteIdRE = /[&?]svelte/

export function createCssTransformerPlugins(ctx: SvelteScopedContext, cssTransformers: PluginOptions['transformers']): Plugin[] {
  const enforces = ['default', 'pre', 'post'] as const
  return enforces.map((enforce): Plugin => ({
    name: `unocss:svelte-scoped-transformers:${enforce}`,
    enforce: enforce === 'default' ? undefined : enforce,

    async transform(code, id) {
      if (!id.match(cssIdRE) || id.match(svelteIdRE))
        return
      ctx.uno.config.transformers = cssTransformers ?? []
      return applyTransformers({
        ...ctx,
        affectedModules: new Set<string>(),
      } as UnocssPluginContext, code, id, enforce)
    },
  }))
}
