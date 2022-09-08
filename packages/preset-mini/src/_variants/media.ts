import type { Variant, VariantContext, VariantObject } from '@unocss/core'
import type { PresetMiniOptions } from '..'
import type { Theme } from '../theme'
import { variantParentMatcher } from '../utils'

export const variantPrint: Variant = variantParentMatcher('print', '@media print')

export const variantCustomMedia = (options: PresetMiniOptions = {}): VariantObject => {
  const mediaRE = new RegExp(`^media-([_\d\w]+)${options.separator}`)
  return {
    name: 'media',
    match(matcher, { theme }: VariantContext<Theme>) {
      const match = matcher.match(mediaRE)
      if (match) {
        const media = theme.media?.[match[1]] ?? `(--${match[1]})`
        return {
          matcher: matcher.slice(match[0].length),
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@media ${media}`,
          }),
        }
      }
    },
    multiPass: true,
  }
}
