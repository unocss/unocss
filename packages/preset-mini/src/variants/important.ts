import type { Variant } from '@unocss/core'

export const variantImportant: Variant = {
  name: 'important',
  match(matcher) {
    const match = matcher.match(/^(important[:-]|!)/)
    if (match) {
      return {
        matcher: matcher.slice(match[0].length),
        body: (body) => {
          body.forEach((v) => {
            if (v[1])
              v[1] += ' !important'
          })
          return body
        },
      }
    }
  },
  autocomplete: '(important)',
}
