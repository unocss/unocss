import type { VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, variantGetParameter } from '../utils'

export const variantAria: VariantObject = {
  name: 'aria',
  match(matcher, { theme }: VariantContext<Theme>) {
    const variant = variantGetParameter('aria', matcher, [':', '-'])
    if (variant) {
      const [match, rest] = variant
      const aria = h.bracket(match) ?? theme.aria?.[match] ?? ''
      if (aria) {
        return {
          matcher: rest,
          selector: s => `${s}[aria-${aria}]`,
        }
      }
    }
  },
}
