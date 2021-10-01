import { NanowindVariant } from '../../types'
import { breakpoints } from './breakpoints'
import { darkClass, lightClass } from './dark'
import { pseudoClasses, pseudoElements } from './pseudo'

export const important: NanowindVariant = {
  match: input => input.startsWith('!') ? input.slice(1) : undefined,
  rewrite: (input) => {
    input.forEach((v) => {
      if (v[1])
        v[1] += ' !important'
    })
    return input
  },
}

export const defaultVariants = [
  important,
  breakpoints,
  darkClass,
  lightClass,
  ...pseudoClasses,
  ...pseudoElements,
]
