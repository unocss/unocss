import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { camelToHyphen, colorableShadows, colorResolver, h, hasParseableColor } from '../utils'
import { varEmpty } from './static'

export const boxShadowsBase = {
  '--un-ring-offset-shadow': '0 0 rgb(0 0 0 / 0)',
  '--un-ring-shadow': '0 0 rgb(0 0 0 / 0)',
  '--un-shadow-inset': varEmpty,
  '--un-shadow': '0 0 rgb(0 0 0 / 0)',
}
const preflightKeys = Object.keys(boxShadowsBase)

export const boxShadows: Rule<Theme>[] = [
  // shadow
  [/^shadow(?:-(.+))?$/, hanldeShadow('shadow'), { custom: { preflightKeys }, autocomplete: ['shadow-$colors', 'shadow-$shadow'] }],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],
  ['shadow-inset', { '--un-shadow-inset': 'inset' }],

  // inset shadow
  [/^inset-shadow(?:-(.+))?$/, hanldeShadow('insetShadow'), { custom: { preflightKeys }, autocomplete: ['inset-shadow-$colors', 'inset-shadow-$insetShadow'] }],
  [/^inset-shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-inset-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],

]

function hanldeShadow(themeKey: 'shadow' | 'insetShadow') {
  return (match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | undefined => {
    const [, d] = match
    const { theme } = ctx
    const v = theme[themeKey]?.[d || 'DEFAULT']
    const c = d ? h.bracket.cssvar(d) : undefined
    const colorVar = camelToHyphen(themeKey)

    if ((v != null || c != null) && !hasParseableColor(c, theme)) {
      return {
        '--un-shadow': colorableShadows((v || c)!, `--un-${colorVar}-color`).join(','),
        'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
      }
    }
    return colorResolver(`--un-${colorVar}-color`, colorVar)(match, ctx)
  }
}
