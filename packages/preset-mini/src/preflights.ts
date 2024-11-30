import type { Preflight } from '@unocss/core'
import type { PresetMiniOptions } from '.'
import type { Theme } from './theme'
import { entriesToCss, toArray } from '@unocss/core'

export function preflights(options: PresetMiniOptions): Preflight<Theme>[] | undefined {
  if (options.preflight) {
    return [
      {
        layer: 'preflights',
        getCSS({ theme, generator }) {
          if (theme.preflightBase) {
            let entries = Object.entries(theme.preflightBase)
            if (options.preflight === 'on-demand') {
              const keys = new Set(Array.from(generator.activatedRules).map(r => r[2]?.custom?.preflightKeys).filter(Boolean).flat())
              entries = entries.filter(([k]) => keys.has(k))
            }

            if (entries.length > 0) {
              let css = entriesToCss(entries)
              if (options.variablePrefix !== 'un-') {
                css = css.replace(/--un-/g, `--${options.variablePrefix}`)
              }
              const roots = toArray(theme.preflightRoot ?? ['*,::before,::after', '::backdrop'])
              return roots.map(root => `${root}{${css}}`).join('')
            }
          }
        },
      },
    ]
  }
}
