import type { Extractor } from '@unocss/core'

export default function extractorMdc(): Extractor {
  return {
    name: '@unocss/extractor-mdc',
    async extract(ctx) {
      if (!/\.(?:md|mdc|markdown)$/i.test(ctx.id ?? ''))
        return

      ctx.code.match(/\.[\w:/\-]+/g)?.forEach((c) => {
        ctx.extracted.add(c.slice(1))
      })
    },
  }
}
