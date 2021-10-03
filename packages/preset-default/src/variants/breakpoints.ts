import { Variant } from '../../../core/src/types'

export const variantBreakpoints: Variant = {
  match(input, theme) {
    for (const point of Object.keys(theme.breakpoints)) {
      if (input.startsWith(`${point}:`) || input.startsWith(`${point}-`))
        return input.slice(point.length + 1)
    }
  },
  mediaQuery(input, theme) {
    const query = input.split(/[:-]/)[0]
    const point = theme.breakpoints[query]
    if (point)
      return `@media (min-width: ${point})`
  },
}
