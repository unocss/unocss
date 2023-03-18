import type { Extractor } from '@unocss/core'

const regexVueTemplate = /<template.*?lang=['"]pug['"][^>]*?>\s*([\s\S]*?\s*)<\/template>/gm

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
    async preprocess(code, id) {
      if (!id)
        return
      if (id.match(/\.pug$/) || id.match(/\?vue&type=template/)) {
        try {
          code = await compile(code, id) || code
        }
        catch {}
      }
      else if (id.match(/\.vue$/)) {
        const matches = Array.from(code.matchAll(regexVueTemplate))
        let tail = ''
        for (const match of matches) {
          if (match && match[1])
            tail += `\n${await compile(match[1], id)}`
        }
        if (tail)
          code = `${code}\n\n${tail}`
      }
      return code
    },
  }
}
