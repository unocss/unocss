import { Variant } from '@unocss/core'

export const variantImportant: Variant = {
  match(matcher) {
    if (matcher.startsWith('!')) {
      return {
        matcher: matcher.slice(1),
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

}

const variantNegativeRe = /[0-9.]+(?:[a-z]+|%)?/
export const variantNegative: Variant = {
  match(matcher) {
    if (matcher.startsWith('-')) {
      return {
        matcher: matcher.slice(1),
        body: (body) => {
          body.forEach((v) => {
            v[1] = v[1]?.toString().replace(variantNegativeRe, i => `-${i}`)
          })
          return body
        },
      }
    }
  },

}

const variantSpaceRe1 = /^space-?([xy])-?(-?.+)$/
const variantSpaceRe2 = /^divide-/
export const variantSpace: Variant = (matcher) => {
  if (variantSpaceRe1.test(matcher) || variantSpaceRe2.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        return `${input}>:not([hidden])~:not([hidden])`
      },
    }
  }
}
