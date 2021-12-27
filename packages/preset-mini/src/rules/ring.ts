import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, handler as h } from '../utils'
import { varEmptyFn } from './static'

export const rings: Rule<Theme>[] = [
  // size
  [/^ring-?(.*)$/, ([, d], { options: { variablePrefix: p } }) => {
    const value = h.px(d || '1')
    if (value) {
      return {
        [`--${p}ring-inset`]: varEmptyFn(p),
        [`--${p}ring-offset-width`]: '0px',
        [`--${p}ring-offset-color`]: '#fff',
        [`--${p}ring-color`]: 'rgba(59, 130, 246, .5)',
        [`--${p}ring-offset-shadow`]: `var(--${p}ring-inset) 0 0 0 var(--${p}ring-offset-width) var(--${p}ring-offset-color)`,
        [`--${p}ring-shadow`]: `var(--${p}ring-inset) 0 0 0 calc(${value} + var(--${p}ring-offset-width)) var(--${p}ring-color)`,
        '-webkit-box-shadow': `var(--${p}ring-offset-shadow), var(--${p}ring-shadow), var(--${p}shadow, 0 0 #0000)`,
        'box-shadow': `var(--${p}ring-offset-shadow), var(--${p}ring-shadow), var(--${p}shadow, 0 0 #0000)`,
      }
    }
  }],

  // offset size
  [/^ring-offset$/, (_, { options: { variablePrefix: p } }) => ({ [`--${p}ring-offset-width`]: '1px' })],
  [/^ring-offset-(.+)$/, ([, d], { options: { variablePrefix: p } }) => ({ [`--${p}ring-offset-width`]: h.px(d || '1') })],

  // colors
  [/^ring-(.+)$/, (m, ctx) => colorResolver(`--${ctx.options.variablePrefix}ring-color`, 'ring')(m, ctx)],
  [/^ring-op(?:acity)?-?(.+)$/, ([, opacity], { options: { variablePrefix: p } }) => ({ [`--${p}ring-opacity`]: h.bracket.percent(opacity) })],

  // offset color
  [/^ring-offset-(.+)$/, (m, ctx) => colorResolver(`--${ctx.options.variablePrefix}ring-offset-color`, 'ring-offset')(m, ctx)],
  [/^ring-offset-op(?:acity)?-?(.+)$/, ([, opacity], { options: { variablePrefix: p } }) => ({ [`--${p}ring-offset-opacity`]: h.bracket.percent(opacity) })],

  // style
  [/^ring-inset$/, (_, { options: { variablePrefix: p } }) => ({ [`--${p}ring-inset`]: 'inset' })],
]
