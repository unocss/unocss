import type { Extractor } from '@unocss/core'

export default function extractorMdc(): Extractor {
  return {
    name: '@unocss/extractor-mdc',
    async extract(ctx) {
      if (!(ctx.id?.match(/\.(md|mdc|markdown)$/i)))
        return

      ctx.code.match(/\.[\w:\/_-]+/g)?.forEach((c) => {
        ctx.extracted.add(c.slice(1))
      })
    },
  }
}
