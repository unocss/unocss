import { Variant } from '@unocss/core'
import { variantBreakpoints } from './breakpoints'
import { variantChildren } from './children'
import { variantColorsClass } from './dark'
import { variantPseudoClasses, variantPseudoElements } from './pseudo'

export * from './breakpoints'
export * from './dark'
export * from './children'
export * from './pseudo'

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

export const variantNegative: Variant = {
  match(matcher) {
    if (matcher.startsWith('-')) {
      return {
        matcher: matcher.slice(1),
        body: (body) => {
          body.forEach((v) => {
            if (v[1]?.toString().match(/^\d/))
              v[1] = `-${v[1]}`
          })
          return body
        },
      }
    }
  },

}

export const variants = [
  variantNegative,
  variantImportant,
  variantBreakpoints,
  ...variantChildren,
  ...variantColorsClass,
  ...variantPseudoClasses,
  ...variantPseudoElements,
]
