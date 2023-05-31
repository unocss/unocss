import type { Plugin } from 'vite'
import { type PluginOptions, type UnocssPluginContext, cssIdRE } from '@unocss/core'
import type { SvelteScopedContext } from '../preprocess'
import { applyTransformers } from '../../../shared-integration/src/transformers'

interface CssTransformerPluginsContext extends SvelteScopedContext {
  affectedModules: Set<string>
}

export function createCssTransformerPlugins(ctx: CssTransformerPluginsContext, cssTransformers: PluginOptions['transformers']): Plugin[] {
  const enforces = ['default', 'pre', 'post'] as const
  return enforces.map((enforce): Plugin => ({
    name: `unocss:svelte-scoped-transformers:${enforce}`,
    enforce: enforce === 'default' ? undefined : enforce,

    async transform(code, id) {
      if (!id.match(cssIdRE))
        return
      ctx.uno.config.transformers = cssTransformers ?? []
      return applyTransformers(ctx as UnocssPluginContext, code, id, enforce)
    },
  }))
}
