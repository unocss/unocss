import { Variant } from '../../../core/src/types'

const regexCache: Record<string, RegExp> = {}

export const variantBreakpoints: Variant = {
  match(input, theme) {
    for (const point of Object.keys(theme.breakpoints || {})) {
      if (!regexCache[point])
        regexCache[point] = new RegExp(`^((?:lt-)?${point}[:-])`)
      const match = input.match(regexCache[point])
      if (match)
        return input.slice(match[1].length)
    }
  },
  mediaQuery(input, theme) {
    const [, d, s] = input.match(/^(lt-)?(\w+)[:-]/) || []
    if (!s)
      return
    let direction = 'min'
    if (d === 'lt-')
      direction = 'max'
    const point = theme.breakpoints?.[s]
    if (point)
      return `@media (${direction}-width: ${point})`
  },
}
