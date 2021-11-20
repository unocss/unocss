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
    let order = parseInt(size)
    if (pre.startsWith('lt-')) {
      direction = 'max'
      order = -order
    }

    const m = matcher.slice(pre.length)
    // container rule is responsive, but also is breakpoint aware
    // it is handled on its own module (container.ts) and so we
    // exclude it from here
    if (m === 'container')
      continue

    return {
      matcher: m,
      parent: [`@media (${direction}-width: ${size})`, order],
    }
  }
}
