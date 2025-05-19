import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { applyTransformers } from '#integration/transformers'

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
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        enforce: order,
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore Compatibility with Legacy Vite
        transform: htmlHandler,
      },
    } satisfies Plugin
  })
}
