import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import { applyTransformers } from '../../shared-integration/src/transformers'

export function createTransformerPlugins(ctx: UnocssPluginContext): Plugin[] {
  const enforces = ['default', 'pre', 'post'] as const
  return enforces.map((enforce): Plugin => ({
    name: `unocss:transformers:${enforce}`,
    enforce: enforce === 'default' ? undefined : enforce,
    transform(code, id) {
      return applyTransformers(ctx, code, id, enforce)
    },
    transformIndexHtml: {
      enforce: enforce === 'default' ? undefined : enforce,
      transform(code) {
        return applyTransformers(ctx, code, 'index.html', enforce)
          .then(t => t?.code)
      },
    },
  }))
}
