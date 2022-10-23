import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, variantGetParameter, variantParentMatcher } from '../utils'

export const variantPrint: Variant = variantParentMatcher('print', '@media print')

export const variantCustomMedia: VariantObject = {
  name: 'media',
  match(matcher, { theme }: VariantContext<Theme>) {
    const variant = variantGetParameter('media', matcher, [':', '-'])
    if (variant) {
      const [match, rest] = variant

      let media = h.bracket(match) ?? ''
      if (media === '')
        media = theme.media?.[match] ?? ''

      if (media) {
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media ${media}`,
          }),
        }
      }
    }
  },
  multiPass: true,
}
