import type { Extractor } from '@unocss/core'

export default function extractorPug(): Extractor {
  async function compile(code: string, id: string) {
    const Pug = await import('pug')
    try {
      return Pug.compile(code, { filename: id })()
      // other build processes will catch pug errors
    }
    catch { }
  }

  return {
    name: 'pug',
    order: -1,
    async extract(ctx) {
      if (!ctx.id)
        return
      if (ctx.id.endsWith('.pug') || ctx.id.match(/\.vue\?vue&type=template/)) {
        try {
          ctx.code = await compile(ctx.code, ctx.id) || ctx.code
        }
        catch {}
      }
      return undefined
    },
  }
}
