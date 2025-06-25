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
  multiPass: true,
  autocomplete: 'aria-$aria',
}

function taggedAria(tagName: string): Variant<Theme> {
  return {
    name: `${tagName}-aria`,
    match(matcher, ctx) {
      const variant = variantGetParameter(`${tagName}-aria-`, matcher, ctx.generator.config.separators)
      if (variant) {
        const [match, rest, label] = variant
        const ariaAttribute = h.bracket(match) ?? ctx.theme.aria?.[match] ?? ''
        if (ariaAttribute) {
          const tagSelectorMap: Record<string, string> = {
            group: `&:is(:where(.group${label ? `\\/${label}` : ''})[aria-${ariaAttribute}] *)`,
            peer: `&:is(:where(.peer${label ? `\\/${label}` : ''})[aria-${ariaAttribute}] ~ *)`,
            previous: `:where(*[aria-${ariaAttribute}] + &)`,
            parent: `:where(*[aria-${ariaAttribute}] > &)`,
            has: `&:has(*[aria-${ariaAttribute}])`,
            in: `:where(*[aria-${ariaAttribute}]) &`,
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

export const variantTaggedAriaAttributes: Variant<Theme>[] = [
  taggedAria('group'),
  taggedAria('peer'),
  taggedAria('parent'),
  taggedAria('previous'),
  taggedAria('has'),
  taggedAria('in'),
]
