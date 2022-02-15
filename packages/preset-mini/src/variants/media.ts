import type { VariantFunction } from '@unocss/core'
import { variantParentMatcher } from '../utils'

export const variantMotions: VariantFunction[] = [
  variantParentMatcher('motion-reduce', '@media (prefers-reduced-motion: reduce)'),
  variantParentMatcher('motion-safe', '@media (prefers-reduced-motion: no-preference)'),
]

export const variantOrientations: VariantFunction[] = [
  variantParentMatcher('landscape', '@media (orientation: landscape)'),
  variantParentMatcher('portrait', '@media (orientation: portrait)'),
]

export const variantPrint: VariantFunction = variantParentMatcher('print', '@media print')

export const variantCustomMedia: VariantFunction = (matcher) => {
  const match = matcher.match(/^media-([_\d\w]+)[:-]/)
  if (match) {
    return {
      matcher: matcher.slice(match[0].length),
      parent: `@media (--${match[1]})`,
    }
  }
}
