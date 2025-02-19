import type { Variant, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantAria: VariantObject<Theme> = {
  name: 'aria',
  match(matcher, ctx) {
    const variant = variantGetParameter('aria-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      const aria = h.bracket(match) ?? ctx.theme.aria?.[match] ?? ''
      if (aria) {
        return {
          matcher: rest,
          selector: s => `${s}[aria-${aria}]`,
        }
      }
    }
  },
}

function taggedAria(tagName: string): Variant<Theme> {
  return {
    name: `${tagName}-aria`,
    match(matcher, ctx) {
      const variant = variantGetParameter(`${tagName}-aria-`, matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest] = variant
        const ariaAttribute = h.bracket(match) ?? ctx.theme.aria?.[match] ?? ''
        if (ariaAttribute) {
          return {
            matcher: `${tagName}-[[aria-${ariaAttribute}]]:${rest}`,
          }
        }
      }
    },
  }
}

export const variantTaggedAriaAttributes: Variant<Theme>[] = [
  taggedAria('group'),
  taggedAria('peer'),
  taggedAria('parent'),
  taggedAria('previous'),
]
