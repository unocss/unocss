import { NanowindVariant } from '../../types'

export const hover: NanowindVariant = {
  match: input => input.startsWith('hover:') ? input.slice(6) : undefined,
  selector: input => `${input}:hover`,
}

export const important: NanowindVariant = {
  match: input => input.startsWith('!') ? input.slice(1) : undefined,
  rewrite: (input) => {
    Object.keys(input).forEach((key) => {
      if (input[key])
        input[key] += ' !important'
    })
    return input
  },
}

export const defaultVariants = [
  hover,
  important,
]
