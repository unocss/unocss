import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { colorableShadows, colorResolver, h, hasParseableColor } from '../utils'
import { varEmpty } from './static'

export const boxShadowsBase = {
  '--un-ring-offset-shadow': '0 0 rgb(0 0 0 / 0)',
  '--un-ring-shadow': '0 0 rgb(0 0 0 / 0)',
  '--un-shadow-inset': varEmpty,
  '--un-shadow': '0 0 rgb(0 0 0 / 0)',
}
const preflightKeys = Object.keys(boxShadowsBase)

export const boxShadows: Rule<Theme>[] = [
  // color
  [/^shadow(?:-(.+))?$/, (match, context) => {
    const [, d] = match
    const { theme } = context
    const v = theme.boxShadow?.[d || 'DEFAULT']
    const c = d ? h.bracket.cssvar(d) : undefined

    if ((v != null || c != null) && !hasParseableColor(c, theme, 'shadowColor')) {
      return {
        '--un-shadow': colorableShadows((v || c)!, '--un-shadow-color').join(','),
        'box-shadow': 'var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
      }
    }
    return colorResolver('--un-shadow-color', 'shadow', 'shadowColor')(match, context)
  }, { custom: { preflightKeys }, autocomplete: ['shadow-$colors', 'shadow-$boxShadow'] }],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],

  // inset
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],
]
