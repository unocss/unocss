import type { VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { getComponent, handler as h } from '../utils'

export const variantSupports: VariantObject = {
  name: 'supports',
  match(matcher, { theme }: VariantContext<Theme>) {
    if (matcher.startsWith('supports-')) {
      const matcherValue = matcher.substring(9)

      const [match, rest] = getComponent(matcherValue, '[', ']', ':') ?? []
      if (!(match && rest && rest !== ''))
        return

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
