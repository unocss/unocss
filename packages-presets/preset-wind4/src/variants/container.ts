import type { VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { variantGetParameter } from '@unocss/rule-utils'
import { h } from '../utils'

export const variantContainerQuery: VariantObject<Theme> = {
  name: '@',
  match(matcher, ctx) {
    if (matcher.startsWith('@container'))
      return

    const variant = variantGetParameter(['@max-', '@min-', '@'], matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest, label] = variant
      const isMax = matcher.startsWith('@max-')
      const unbracket = h.bracket(match, ctx.theme)
      const container = unbracket ? h.numberWithUnit(unbracket) : ctx.theme.container?.[match]
      if (container) {
        const keys = Object.keys(ctx.theme.container ?? {})
        const index = keys.indexOf(match)
        let order = isMax ? 999 - keys.length - index : 1000 + index
        if (label)
          order += 1000
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@container${label ? ` ${label} ` : ' '}(width ${isMax ? '<' : '>='} ${container})`,
            parentOrder: order,
          }),
        }
      }
    }
  },
  multiPass: true,
}
