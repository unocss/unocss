import type { Variant, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantDataAttribute: VariantObject<Theme> = {
  name: 'data',
  match(matcher, ctx) {
    const variant = variantGetParameter('data-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
      if (dataAttribute) {
        return {
          matcher: rest,
          selector: s => `${s}[data-${dataAttribute}]`,
        }
      }
    }
  },
}

function taggedData(tagName: string): Variant<Theme> {
  return {
    name: `${tagName}-data`,
    match(matcher, ctx) {
      const variant = variantGetParameter(`${tagName}-data-`, matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest, label] = variant
        const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
        if (dataAttribute) {
          return {
            matcher: `${tagName}-[[data-${dataAttribute}]]${label ? `/${label}` : ''}:${rest}`,
          }
        }
      }
    },
  }
}

export const variantTaggedDataAttributes: Variant<Theme>[] = [
  taggedData('group'),
  taggedData('peer'),
  taggedData('parent'),
  taggedData('previous'),
]
