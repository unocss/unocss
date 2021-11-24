import { Rule, toArray, Shortcut } from '@unocss/core'
import { Theme } from '../theme'

const queryMatcher = /@media \(min-width: (.+)\)/

export const container: Rule<Theme>[] = [
  [
    /^__container$/,
    (m, { variantHandlers }) => {
      let width = '100%'
      for (const v of variantHandlers) {
        const query = toArray(v.parent || [])[0]
        if (typeof query === 'string') {
          const match = query.match(queryMatcher)?.[1]
          if (match)
            width = match
        }
      }
      return { 'max-width': width }
    },
    { internal: true },
  ],
]

export const containerShortcuts: Shortcut<Theme>[] = [
  [/^(?:(\w+)[:-])?container$/, ([, bp], { theme }) => {
    let points = Object.keys(theme.breakpoints || {})
    if (bp) {
      if (!points.includes(bp))
        return
      points = points.slice(points.indexOf(bp))
    }
    const shortcuts = points.map(p => `${p}:__container`)
    if (!bp)
      shortcuts.unshift('__container')
    return shortcuts
  }],
]
