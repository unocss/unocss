import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { variantParentMatcher } from '../utils'

export const variantPrint: Variant = variantParentMatcher('print', '@media print')

export const variantCustomMedia = (): VariantObject => {
  let re: RegExp
  return {
    name: 'media',
    match(matcher, ctx: VariantContext<Theme>) {
      re = re || new RegExp(`^media-([_\d\w]+)${ctx.generator.config.separator}`)
      const match = matcher.match(re)
      if (match) {
        const media = ctx.theme.media?.[match[1]] ?? `(--${match[1]})`
        return {
          matcher: matcher.slice(match[0].length),
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media ${media}`,
          }),
        }
      }
    },
    multiPass: true,
  }
}
