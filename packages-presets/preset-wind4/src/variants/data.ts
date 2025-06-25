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
  multiPass: true,
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
          const tagSelectorMap: Record<string, string> = {
            group: `&:is(:where(.group${label ? `\\/${label}` : ''})[data-${dataAttribute}] *)`,
            peer: `&:is(:where(.peer${label ? `\\/${label}` : ''})[data-${dataAttribute}] ~ *)`,
            previous: `:where(*[data-${dataAttribute}] + &)`,
            parent: `:where(*[data-${dataAttribute}] > &)`,
            has: `&:has(*[data-${dataAttribute}])`,
            in: `:where(*[data-${dataAttribute}]) &`,
          }

          return {
            matcher: rest,
            handle: (input, next) => next({
              ...input,
              parent: `${input.parent ? `${input.parent} $$ ` : ''}${input.selector}`,
              selector: tagSelectorMap[tagName],
            }),
          }
        }
      }
    },
    multiPass: true,
  }
}

export const variantTaggedDataAttributes: Variant<Theme>[] = [
  taggedData('group'),
  taggedData('peer'),
  taggedData('parent'),
  taggedData('previous'),
  taggedData('has'),
  taggedData('in'),
]
