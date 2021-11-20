import { Rule } from '@unocss/core'
import { Theme } from '../theme'

export const container: Rule<Theme>[] = [
  [/^((.+):)?container$/, (m, { theme }) => {
    const bps = theme.breakpoints

    if (!bps)
      return undefined

    const [,, useBp] = m

    if (useBp && useBp.length > 0 && !bps[useBp])
      return undefined

    const keys = Array.from(Object.keys(bps))

    if (bps[useBp]) {
      const idx = keys.findIndex(cbp => cbp === useBp)
      if (idx !== -1) {
        return keys.slice(idx).map((bp, idx) => {
          return `@media (min-width:${bps[bp]}) {.${useBp}\\:container,[${useBp}\\:container=""]{${idx === 0 ? 'width:100%;' : ''}max-width:${bps[bp]}}}`
        }).join('\n')
      }
      return undefined
    }

    const entries = keys.map(bp => `@media (min-width:${bps[bp]}) {.container,[container=""]{max-width:${bps[bp]}}}`)
    return `.container,[container=""]{width:100%}\n${entries.join('\n')}`
  }],
]
