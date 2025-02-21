import type { VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantContainerQuery: VariantObject<Theme> = {
  name: '@',
  match(matcher, ctx) {
    if (matcher.startsWith('@container'))
      return

    const variant = variantGetParameter('@', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest, label] = variant
      const unbracket = h.bracket(match)
      let container: string | undefined
      if (unbracket) {
        container = h.numberWithUnit(unbracket)
      }
      else {
        container = ctx.theme.container?.[match] ?? ''
      }

      if (container) {
        let order = 1000 + Object.keys(ctx.theme.container ?? {}).indexOf(match)

        if (label)
          order += 1000

        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@container${label ? ` ${label} ` : ' '}(min-width: ${container})`,
            parentOrder: order,
          }),
        }
      }
    }
  },
  multiPass: true,
}
