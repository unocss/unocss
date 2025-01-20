import type { Variant, VariantObject } from '@unocss/core'
import { h, variantGetBracket } from '../utils'

function scopeMatcher(name: string, combinator: string): VariantObject {
  return {
    name: `combinator:${name}`,
    match(matcher, ctx) {
      if (!matcher.startsWith(name))
        return

      const separators = ctx.generator.config.separators
      let body = variantGetBracket(`${name}-`, matcher, separators)
      if (!body) {
        for (const separator of separators) {
          if (matcher.startsWith(`${name}${separator}`)) {
            body = ['', matcher.slice(name.length + separator.length)]
            break
          }
        }
        if (!body)
          return
      }

      let bracketValue = h.bracket(body[0]) ?? ''
      if (bracketValue === '')
        bracketValue = '*'

      return {
        matcher: body[1],
        selector: s => `${s}${combinator}${bracketValue}`,
      }
    },
    multiPass: true,
  }
}

export const variantCombinators: Variant[] = [
  scopeMatcher('all', ' '),
  scopeMatcher('children', '>'),
  scopeMatcher('next', '+'),
  scopeMatcher('sibling', '+'),
  scopeMatcher('siblings', '~'),
]
