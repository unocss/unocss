import type { Variant, VariantObject } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter, variantParentMatcher } from '../utils'

export const variantNoscript: VariantObject = variantParentMatcher('noscript', '@media (scripting: none)')

export const variantScripting: VariantObject<Theme> = {
  name: 'scripting',
  match(matcher, ctx) {
    const variant = variantGetParameter(['script-', 'scripting-'], matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant
      const scriptingValues = ['none', 'initial-only', 'enabled']

      if (scriptingValues.includes(match)) {
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media (scripting: ${match})`,
          }),
        }
      }
    }
  },
  multiPass: true,
  autocomplete: ['(scripting|script)-(none|initial-only|enabled)'],
}

export const variantPrint = variantParentMatcher('print', '@media print') as VariantObject<Theme>

export const variantCustomMedia: VariantObject<Theme> = {
  name: 'media',
  match(matcher, ctx) {
    const variant = variantGetParameter('media-', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest] = variant

      let media = h.bracket(match) ?? ''
      if (media === '')
        media = ctx.theme.media?.[match] ?? ''

      if (media) {
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media ${media}`,
          }),
        }
      }
    }
  },
  multiPass: true,
  autocomplete: 'media-$media',
}

export const variantContrasts: Variant<Theme>[] = [
  variantParentMatcher('contrast-more', '@media (prefers-contrast: more)'),
  variantParentMatcher('contrast-less', '@media (prefers-contrast: less)'),
]

export const variantMotions: Variant<Theme>[] = [
  variantParentMatcher('motion-reduce', '@media (prefers-reduced-motion: reduce)'),
  variantParentMatcher('motion-safe', '@media (prefers-reduced-motion: no-preference)'),
]

export const variantOrientations: Variant<Theme>[] = [
  variantParentMatcher('landscape', '@media (orientation: landscape)'),
  variantParentMatcher('portrait', '@media (orientation: portrait)'),
]

export const variantForcedColors: Variant<Theme>[] = [
  variantParentMatcher('forced-colors', '@media (forced-colors: active)'),
]
