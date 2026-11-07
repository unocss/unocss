import type { Variant } from '@unocss/core'

export const variantStartingStyle: Variant = {
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
