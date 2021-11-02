import { Variant } from '@unocss/core'
import { Theme } from '../theme'
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
            v[1] = v[1]?.toString().replace(/[0-9.]+[a-z]+/, i => `-${i}`)
          })
          return body
        },
      }
    }
  },

}

export const variantSpace: Variant = (matcher) => {
  if (/^space-?([xy])-?(-?.+)$/.test(matcher)) {
    return {
      matcher,
      selector: (input) => {
        return `${input}>:not([hidden])~:not([hidden])`
      },
    }
  }
}

export const variants: Variant<Theme>[] = [
  variantSpace,
  variantNegative,
  variantImportant,
  variantBreakpoints,
  ...variantChildren,
  ...variantColorsClass,
  variantPseudoClasses,
  variantPseudoElements,
]
