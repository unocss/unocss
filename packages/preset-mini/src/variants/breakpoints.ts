import type { Variant } from '@unocss/core'
import type { Theme } from '../theme'

const regexCache: Record<string, RegExp> = {}

export const variantBreakpoints: Variant<Theme> = (matcher, _, theme) => {
  const variantEntries: Array<[string, string, number]>
      = Object.entries(theme.breakpoints || {}).map(([point, size], idx) => [point, size, idx])
  for (const [point, size, idx] of variantEntries) {
    if (!regexCache[point])
      regexCache[point] = new RegExp(`^((?:[al]t-)?${point}[:-])`)

    const match = matcher.match(regexCache[point])
    if (!match)
      continue

    const [, pre] = match

    const m = matcher.slice(pre.length)
    // container rule is responsive, but also is breakpoint aware
    // it is handled on its own module (container.ts) and so we
    // exclude it from here
    if (m === 'container')
      continue

    let direction = 'min'
    let order = 1000 // parseInt(size)
    if (pre.startsWith('lt-')) {
      direction = 'max'
      order -= (idx + 1)
    }
    else {
      order += (idx + 1)
    }

    // support for windicss @<breakpoint> => last breakpoint will not have the upper bound
    if (pre.startsWith('at-') && idx < variantEntries.length - 1) {
      return {
        matcher: m,
        parent: [`@media (min-width: ${size}) and (max-width: ${variantEntries[idx + 1][1]})`, order],
      }
    }

    return {
      matcher: m,
      parent: [`@media (${direction}-width: ${size})`, order],
    }
  }
}
