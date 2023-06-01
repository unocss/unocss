import type { Variant } from '@unocss/core'
import { h, variantGetBracket } from '@unocss/preset-mini/utils'

export const variantHasPseudo: Variant[] = [
  {
    name: 'has',
    match(input, ctx) {
      const body = variantGetBracket('has-', input, ctx.generator.config.separators)
      if (!body)
        return

      const [match, reset] = body
      const bracketValue = h.bracket(match)
      if (!bracketValue)
        return

      if (match) {
        return {
          matcher: reset,
          handle: (input, next) => next({
            ...input,
            selector: `${input.selector || ''}:has(${bracketValue})`,
          }),
        }
      }
    },
  },
  {
    name: 'group-has',
    match(input, ctx) {
      const body = variantGetBracket('group-has-', input, ctx.generator.config.separators)
      if (!body)
        return

      const [match, reset] = body
      const bracketValue = h.bracket(match)
      if (!bracketValue)
        return

      if (match) {
        return {
          matcher: reset,
          handle: (input, next) => next({
            ...input,
            selector: `.group:has(${bracketValue}) ${input.selector || ''}`,
          }),
        }
      }
    },
  },
  {
    name: 'peer-has',
    match(input, ctx) {
      const body = variantGetBracket('peer-has-', input, ctx.generator.config.separators)
      if (!body)
        return

      const [match, reset] = body
      const bracketValue = h.bracket(match)
      if (!bracketValue)
        return

      if (match) {
        return {
          matcher: reset,
          handle: (input, next) => next({
            ...input,
            selector: `.peer:has(${bracketValue}) ~ ${input.selector || ''}`,
          }),
        }
      }
    },
  },
]
