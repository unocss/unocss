import type { Preflight, PreflightContext } from '@unocss/core'
import { entriesToCss, toArray } from '@unocss/core'
import type { Theme } from './theme'

export const preflights: Preflight[] = [
  {
    layer: 'preflights',
    getCSS(ctx: PreflightContext<Theme>) {
      if (ctx.theme.preflightBase) {
        const css = entriesToCss(Object.entries(ctx.theme.preflightBase))
        let roots = toArray(ctx.theme.preflightRoot)
        if (!roots.length)
          roots = ['*,::before,::after', '::backdrop']

        return roots.map(root => `${root}{${css}}`).join('')
      }
    },
  },
]

