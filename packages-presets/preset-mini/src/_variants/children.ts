import type { Variant } from '@unocss/core'
import { PseudoClasses, PseudoClassesColon } from '@unocss/rule-utils'

function hasSelectorVariantBefore(rawBefore: string): boolean {
  if (!rawBefore)
    return false
  const segments = rawBefore.split(/[:_]/).filter(Boolean)
  return segments.some((s) => {
    if (PseudoClasses[s] || PseudoClassesColon[s]) {
      return true
    }
    if (s.startsWith('aria-') || s.startsWith('data-') || s.startsWith('nth-') || s.startsWith('[')
      || s.startsWith('is-') || s.startsWith('where-') || s.startsWith('not-') || s.startsWith('has-')) {
      return true
    }
    return false
  })
}

export const variantChildren: Variant[] = [
  {
    name: 'variant-children',
    match(input, ctx) {
      const re = new RegExp(`^\\*(?:${ctx.generator.config.separators.join('|')})`)
      const match = input.match(re)
      if (!match)
        return
      const rawBefore = ctx.rawSelector.slice(0, ctx.rawSelector.length - input.length)
      const order = hasSelectorVariantBefore(rawBefore) ? 1 : -1
      return {
        matcher: input.slice(match[0].length),
        handle: (input, next) => next({
          ...input,
          selector: `${input.selector} > *`,
        }),
        order,
      }
    },
    autocomplete: '*:',
  },
]
