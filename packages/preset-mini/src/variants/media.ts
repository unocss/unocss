import type { VariantContext, VariantFunction } from '@unocss/core'
import type { Theme } from '../theme'
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

export const variantCustomMedia: VariantFunction = (matcher, { theme }: VariantContext<Theme>) => {
  const match = matcher.match(/^media-([_\d\w]+(?:,[_\d\w]+)*)[:-]/)
  if (match) {
    const media = match[1].split(',').map(m => theme.media?.[m] ?? `--${m}`).join(' and ')
    return {
      matcher: matcher.slice(match[0].length),
      parent: `@media (${media})`,
    }
  }
}
