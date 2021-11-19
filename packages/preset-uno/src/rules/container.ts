import { Rule } from '@unocss/core'
import { Theme } from '../theme'

const defaultBpn = '__un__default__'
const cachedBreakpoints = new Map<string, string>()

export const container: Rule<Theme>[] = [
  [/^((.+):)?container$/, (m, { theme }) => {
    const bps = theme.breakpoints

    if (!bps)
      return { width: '100%' }

    let entry: string | undefined

    if (m.length > 1) {
      const [, mbp, useBp] = m
      if (bps[useBp]) {
        if (!cachedBreakpoints.has(mbp)) {
          const keys = Array.from(Object.keys(bps))
          const idx = keys.findIndex(cbp => cbp === useBp)
          if (idx !== -1) {
            entry = keys.slice(idx).map((bp, idx) => {
              return `@media (min-width:${bps[bp]}) {.${useBp}\\:container,[${useBp}\\\:container=""]{${idx === 0 ? 'width:100%;' : ''}max-width:${bps[bp]}}}`
            }).join('\n')
            cachedBreakpoints.set(mbp, entry)
          }
        }
        if (entry)
          return entry
      }
    }

    entry = cachedBreakpoints.get(defaultBpn)
    if (!entry) {
      const entries = Object.keys(bps).map(bp => `@media (min-width:${bps[bp]}) {.container,[container=""]{max-width:${bps[bp]}}}`)
      entry = `.container,[container=""]{width:100%}\n${entries.join('\n')}`
      cachedBreakpoints.set(defaultBpn, entry)
    }

    return entry
  }],
]
