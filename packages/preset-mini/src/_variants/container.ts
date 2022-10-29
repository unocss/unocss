import type { VariantContext, VariantObject } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, variantGetParameter } from '../utils'

export const variantContainerQuery: VariantObject = {
  name: '@',
  match(matcher, { theme }: VariantContext<Theme>) {
    if (matcher.startsWith('@container'))
      return

    const variant = variantGetParameter('@', matcher, [':', '-'])
    if (variant) {
      const [match, rest, label] = variant
      const container = h.bracket(match) ?? theme.containers?.[match] ?? ''

      if (container) {
        warnOnce('The container query variant is experimental and may not follow semver.')
        return {
          matcher: rest,
          handle: (input, next) => next({
            ...input,
            parent: `${input.parent ? `${input.parent} $$ ` : ''}@container${label ? ` ${label} ` : ' '}${container}`,
          }),
        }
      }
    }
  },
  multiPass: true,
}
