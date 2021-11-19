import { Rule } from '@unocss/core'
import { Theme } from '../theme'

export const container: Rule<Theme>[] = [
  [/^((.+):)?container$/, (m, { theme }) => {
    const bps = theme.breakpoints

    if (!bps)
      return { width: '100%' }

    if (m.length > 1) {
      const [,, useBp] = m
      if (bps[useBp]) {
        const keys = Array.from(Object.keys(bps))
        const idx = keys.findIndex(cbp => cbp === useBp)
        if (idx !== -1) {
          return keys.slice(idx).map((bp, idx) => {
            return `@media (min-width:${bps[bp]}) {.${useBp}\\:container,[${useBp}\\:container=""]{${idx === 0 ? 'width:100%;' : ''}max-width:${bps[bp]}}}`
          }).join('\n')
        }
      }
    }

    const entries = Object.keys(bps).map(bp => `@media (min-width:${bps[bp]}) {.container,[container=""]{max-width:${bps[bp]}}}`)
    return `.container,[container=""]{width:100%}\n${entries.join('\n')}`
  }],
]
