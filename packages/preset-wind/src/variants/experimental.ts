import type { Variant } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import { h, variantGetBracket, variantMatcher } from '@unocss/preset-mini/utils'

export const variantStickyHover: Variant[] = [
  variantMatcher('@hover', (input) => {
    warnOnce('The @hover variant is experimental and may not follow semver.')
    return {
      parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (hover: hover) and (pointer: fine)`,
      selector: `${input.selector || ''}:hover`,
    }
  }),
]

export const variantHasPseudo: Variant[] = [
  {
    name: 'has',
    match(input, ctx) {
      warnOnce('The `has-*` variants for :has(...) pseudo-class is experimental and may not follow semver')

      const body = variantGetBracket('has-', input, ctx.generator.config.separators)
      if (body) {
        const [match, reset] = body

        if (match) {
          return {
            matcher: reset,
            handle: (input, next) => next({
              ...input,
              selector: `${input.selector || ''}:has(${h.bracket(match)})`,
            }),
          }
        }
      }
    },
  },
]
