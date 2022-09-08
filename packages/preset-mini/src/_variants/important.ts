import type { Variant } from '@unocss/core'

export const variantImportant = (): Variant => {
  let re: RegExp
  return {
    name: 'important',
    match(matcher, ctx) {
      let base: string | undefined

      re = re || new RegExp(`^(important${ctx.generator.config.separator}|!)`)
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
              if (v[1])
                v[1] += ' !important'
            })
            return body
          },
        }
      }
    },
  }
}
