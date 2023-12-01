import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantDataAttribute: VariantObject = {
  name: 'data',
  match(matcher, ctx: VariantContext<Theme>) {
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

function taggedData(tagName: string): Variant {
  return {
    name: `${tagName}-data`,
    match(matcher, ctx: VariantContext<Theme>) {
      const variant = variantGetParameter(`${tagName}-data-`, matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest] = variant
        const dataAttribute = h.bracket(match) ?? ctx.theme.data?.[match] ?? ''
        if (dataAttribute) {
          return {
            matcher: `${tagName}-[[data-${dataAttribute}]]:${rest}`,
          }
        }
      }
    },
  }
}

export const variantTaggedDataAttributes: Variant[] = [
  taggedData('group'),
  taggedData('peer'),
  taggedData('parent'),
  taggedData('previous'),
]
