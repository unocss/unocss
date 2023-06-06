import type { VariantContext, VariantObject } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import type { Theme } from '../theme'
import { h, variantGetParameter } from '../utils'

export const variantContainerQuery: VariantObject = {
  name: '@',
  match(matcher, ctx: VariantContext<Theme>) {
    if (matcher.startsWith('@container'))
      return

    const variant = variantGetParameter('@', matcher, ctx.generator.config.separators)
    if (variant) {
      const [match, rest, label] = variant
      const unbracket = h.bracket(match)
      let container: string | undefined
      if (unbracket) {
        const minWidth = h.numberWithUnit(unbracket)
        if (minWidth)
          container = `(min-width: ${minWidth})`
      }
      else {
        container = ctx.theme.containers?.[match] ?? ''
      }

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
