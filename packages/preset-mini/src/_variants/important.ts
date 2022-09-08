import type { Variant } from '@unocss/core'
import type { PresetMiniOptions } from '..'

export const variantImportant = (options: PresetMiniOptions = {}): Variant => {
  const importantRE = new RegExp(`^(important${options.separator}|!)`)
  return {
    name: 'important',
    match(matcher) {
      let base: string | undefined

      const match = matcher.match(importantRE)
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
