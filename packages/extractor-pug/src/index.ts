import type { Extractor } from '@unocss/core'

const regexVueTemplate = /<template.*?lang=['"]pug['"][^>]*?>\n([\s\S]*?\n)<\/template>/gm

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
      if (ctx.id?.match(/\.vue$/ || ctx.id?.match(/\.vue\?vue/))) {
        const matches = Array.from(ctx.code.matchAll(regexVueTemplate))
        let tail = ''
        for (const match of matches) {
          if (match && match[1])
            tail += `\n${await compile(match[1], ctx.id)}`
        }
        if (tail)
          ctx.code = `${ctx.code}\n\n${tail}`
      }
      else if (ctx.id?.endsWith('.pug')) {
        ctx.code = await compile(ctx.code, ctx.id) || ctx.code
      }
      return undefined
    },
  }
}
