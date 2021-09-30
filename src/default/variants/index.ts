import { NanowindVariant } from '../../types'
import { breakpoints } from './breakpoints'

export const hover: NanowindVariant = {
  match: input => input.startsWith('hover:') ? input.slice(6) : undefined,
  selector: input => `${input}:hover`,
}

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
  hover,
  important,
  breakpoints,
]
