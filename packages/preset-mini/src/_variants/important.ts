import type { VariantObject } from '@unocss/core'

export function variantImportant(): VariantObject {
  let re: RegExp
  return {
    name: 'important',
    match(matcher, ctx) {
      if (!re)
        re = new RegExp(`^(important(?:${ctx.generator.config.separators.join('|')})|!)`)

      let base: string | undefined
      const match = matcher.match(re)
      if (match)
        base = matcher.slice(match[0].length)
      else if (matcher.endsWith('!'))
        base = matcher.slice(0, -1)

      if (base) {
        return {
          matcher: base,
          body: (body) => {
            body.forEach((v) => {
              if (v[1] != null)
                v[1] += ' !important'
            })
            return body
          },
        }
      }
    },
  }
}
