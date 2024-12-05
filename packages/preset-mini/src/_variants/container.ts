import type { VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantContainerQuery: VariantObject = {
  name: '@',
  match(matcher, ctx: VariantContext<Theme>) {
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
        container = ctx.theme.containers?.[match] ?? ''
      }

      if (container) {
        let order = 1000 + Object.keys(ctx.theme.containers ?? {}).indexOf(match)

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
