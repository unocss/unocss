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

export const negative: NanowindVariant = {
  match: input => input.startsWith('-') ? input.slice(1) : undefined,
  rewrite: (input) => {
    input.forEach((v) => {
      if (v[1]?.toString().match(/^\d/))
        v[1] = `-${v[1]}`
    })
    return input
  },
}

export const defaultVariants = [
  negative,
  important,
  breakpoints,
  darkClass,
  lightClass,
  ...pseudoClasses,
  ...pseudoElements,
]
