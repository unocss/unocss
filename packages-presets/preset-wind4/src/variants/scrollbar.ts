import type { VariantObject } from '@unocss/core'
import type { Theme } from '../theme'

const scrollbarSelectors: Record<string, string[]> = {
  'w': ['::-webkit-scrollbar'],
  'h': ['::-webkit-scrollbar'],
  'radius': ['::-webkit-scrollbar-thumb', '::-webkit-scrollbar-track'],
  'track-radius': ['::-webkit-scrollbar-track'],
  'thumb-radius': ['::-webkit-scrollbar-thumb'],
}

/**
 * Match the scrollbar size utilities (`scrollbar-w-*`, `scrollbar-h-*`,
 * `scrollbar-(track-|thumb-)?radius-*`) and apply them to the
 * corresponding `::-webkit-scrollbar*` pseudo elements.
 *
 * Declarations are emitted by the internal `$ scrollbar-*` rules,
 * see rules/scrolls.
 */
export const variantScrollbarSize: VariantObject<Theme> = {
  name: 'scrollbar',
  match(matcher) {
    const m = matcher.match(/^scrollbar-((?:track|thumb)-radius|radius|w|h)-(.+)$/)
    if (!m)
      return
    const [, part, body] = m
    return scrollbarSelectors[part].map((selector) => {
      return {
        // Prepend `$ ` (with space!) to the rule to be matched, preventing
        // the token from being matched directly from user-generated input.
        // See rules/scrolls.
        matcher: `$ scrollbar-${part}-${body}`,
        handle: (input, next) => {
          return next({
            ...input,
            selector: `${input.selector}${selector}`,
            noMerge: true,
          })
        },
      }
    })
  },
}
