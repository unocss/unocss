import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { variantGetParameter } from '@unocss/rule-utils'
import { h } from '../utils'

/**
 * Match `${prefix}data-*` and its negated form `${prefix}not-data-*`,
 * returning the attribute selector, e.g. `[data-foo]` or `:not([data-foo])`.
 */
function matchDataAttribute(prefix: string, matcher: string, ctx: Readonly<VariantContext<Theme>>): [selector: string, rest: string, label: string] | undefined {
  const negated = matcher.startsWith(`${prefix}not-data-`)
  const variant = variantGetParameter(`${prefix}${negated ? 'not-' : ''}data-`, matcher, ctx.generator.config.separators)
  if (variant) {
    const [match, rest, label] = variant
    const dataAttribute = h.bracket(match, ctx.theme) ?? ctx.theme.data?.[match] ?? ''
    if (dataAttribute) {
      const selector = `[data-${dataAttribute}]`
      return [negated ? `:not(${selector})` : selector, rest, label]
    }
  }
}

export const variantDataAttribute: VariantObject<Theme> = {
  name: 'data',
  match(matcher, ctx) {
    const variant = matchDataAttribute('', matcher, ctx)
    if (variant) {
      const [selector, rest] = variant
      return {
        matcher: rest,
        selector: s => `${s}${selector}`,
      }
    }
  },
  multiPass: true,
}

function taggedData(tagName: string): Variant<Theme> {
  return {
    name: `${tagName}-data`,
    match(matcher, ctx) {
      const variant = matchDataAttribute(`${tagName}-`, matcher, ctx)
      if (variant) {
        const [selector, rest, label] = variant
        const tagSelectorMap: Record<string, string> = {
          group: `&:is(:where(.group${label ? `\\/${label}` : ''})${selector} *)`,
          peer: `&:is(:where(.peer${label ? `\\/${label}` : ''})${selector} ~ *)`,
          previous: `:where(*${selector} + &)`,
          parent: `:where(*${selector} > &)`,
          has: `&:has(*${selector})`,
          in: `:where(*${selector}) &`,
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
