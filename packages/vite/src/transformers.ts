import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'
import { applyTransformers } from '../../shared-integration/src/transformers'

export function createTransformerPlugins(ctx: UnocssPluginContext): Plugin[] {
  const orders = ['default', 'pre', 'post'] as const
  return orders.map((_order): Plugin => {
    const order = _order === 'default' ? undefined : _order
    const htmlHandler = (code: string) => {
      return applyTransformers(ctx, code, 'index.html', order)
        .then(t => t?.code)
    }
    return {
      name: `unocss:transformers:${order}`,
      enforce: order,
      transform(code, id) {
        return applyTransformers(ctx, code, id, order)
      },
      transformIndexHtml: {
        order,
        handler: htmlHandler,
        // Compatibility with Legacy Vite
        enforce: order,
        transform: htmlHandler,
      },
    } satisfies Plugin
  })
}
