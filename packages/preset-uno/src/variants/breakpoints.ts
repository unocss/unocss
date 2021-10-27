import { Variant } from '@unocss/core'
import { Theme } from '../theme'

const regexCache: Record<string, RegExp> = {}

export const variantBreakpoints: Variant<Theme> = (matcher, _, theme) => {
  for (const [point, size] of Object.entries(theme.breakpoints || {})) {
    if (!regexCache[point])
      regexCache[point] = new RegExp(`^((?:lt-)?${point}[:-])`)

    const match = matcher.match(regexCache[point])
    if (!match)
      continue

    const [, pre] = match
    let direction = 'min'
    if (pre.startsWith('lt-'))
      direction = 'max'

    return {
      matcher: matcher.slice(pre.length),
      mediaQuery: `@media (${direction}-width: ${size})`,
    }
  }
}
