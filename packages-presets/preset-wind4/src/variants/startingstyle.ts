import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'

export const variantStartingStyle: Variant<Theme> = {
  name: 'starting',
  match(matcher) {
    if (!matcher.startsWith('starting:'))
      return

    return {
      matcher: matcher.slice(9),
      handle: (input, next) => next({
        ...input,
        parent: input.parent ? `${input.parent} $$ @starting-style` : '@starting-style',
      }),
    }
  },
}
