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
        parent: `@starting-style`,
      }),
    }
  },
}
