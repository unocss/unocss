import type { Preflight, PreflightContext } from '@unocss/core'
import { entriesToCss } from '@unocss/core'
import type { Theme } from './theme'

export const preflights: Preflight[] = [
  {
    layer: 'preflights',
    getCSS(ctx: PreflightContext<Theme>) {
      if (ctx.theme.preflightBase)
        return `*,::before,::after{${entriesToCss(Object.entries(ctx.theme.preflightBase))}}`
    },
  },
]

