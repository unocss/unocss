import type { Preflight } from '@unocss/core'
import type { Theme } from './theme'
import { entriesToCss, toArray } from '@unocss/core'

export const preflights: Preflight<Theme>[] = [
  {
    layer: 'preflights',
    getCSS({ theme, activeRules }) {
      if (theme.preflightBase) {
        const keys = new Set(Array.from(activeRules).map(r => r[2]?.custom?.preflightKeys).filter(Boolean).flat())
        const entries = Object.entries(theme.preflightBase).filter(([k]) => keys.has(k))
        if (entries.length > 0) {
          const css = entriesToCss(entries)
          const roots = toArray(theme.preflightRoot ?? ['*,::before,::after', '::backdrop'])
          return roots.map(root => `${root}{${css}}`).join('')
        }
      }
    },
  },
]
