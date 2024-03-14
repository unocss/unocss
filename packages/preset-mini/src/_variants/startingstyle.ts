import type { Variant } from '@unocss/core'

export const variantStartingStyle: Variant = {
  name: 'start',
  match(matcher) {
    if (!matcher.startsWith('start:'))
      return

    return {
      matcher: matcher.slice(6),
      handle: (input, next) => next({
        ...input,
        parent: `@starting-style`,
      }),
    }
  },
}
