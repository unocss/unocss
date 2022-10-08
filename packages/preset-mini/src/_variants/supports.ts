import type { VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, variantGetComponent } from '../utils'

export const variantSupports: VariantObject = {
  name: 'supports',
  match(matcher, { theme }: VariantContext<Theme>) {
    const variant = variantGetComponent('supports', matcher)
    if (variant) {
      const [match, rest] = variant

      let supports = h.bracket(match) ?? ''
      if (supports === '') {
        const themeValue = theme.supports?.[match]
        if (themeValue)
          supports = themeValue
      }

      if (supports) {
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@supports ${supports}`,
          }),
        }
      }
    }
  },
  multiPass: true,
}
