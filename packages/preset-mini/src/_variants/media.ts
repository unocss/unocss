import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { getComponent, handler as h, variantParentMatcher } from '../utils'

export const variantPrint: Variant = variantParentMatcher('print', '@media print')

export const variantCustomMedia: VariantObject = {
  name: 'media',
  match(matcher, { theme }: VariantContext<Theme>) {
    if (matcher.startsWith('media-')) {
      const matcherValue = matcher.substring(6)

      const [match, rest] = getComponent(matcherValue, '[', ']', ':') ?? []
      if (!(match && rest && rest !== ''))
        return

      let media = h.bracket(match) ?? ''
      if (media === '') {
        const themeValue = theme.media?.[match]
        if (themeValue)
          media = themeValue
      }

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
