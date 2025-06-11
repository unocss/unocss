import type { CSSObject, CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorableShadows, colorResolver, defineProperty, h, hasParseableColor, hyphenate } from '../utils'

export const shadowProperties = {
  shadow: defineProperty('--un-shadow', { initialValue: '0 0 #0000' }),
  shadowColor: defineProperty('--un-shadow-color'),
  insetShadow: defineProperty('--un-inset-shadow', { initialValue: '0 0 #0000' }),
  insetShadowColor: defineProperty('--un-inset-shadow-color'),
  ringColor: defineProperty('--un-ring-color'),
  ringShadow: defineProperty('--un-ring-shadow', { initialValue: '0 0 #0000' }),
  insetRingColor: defineProperty('--un-inset-ring-color'),
  insetRingShadow: defineProperty('--un-inset-ring-shadow', { initialValue: '0 0 #0000' }),
  ringInset: defineProperty('--un-ring-inset'),
  ringOffsetWidth: defineProperty('--un-ring-offset-width', { syntax: '<length>', initialValue: '0px' }),
  ringOffsetColor: defineProperty('--un-ring-offset-color'),
  ringOffsetShadow: defineProperty('--un-ring-offset-shadow', { initialValue: '0 0 #0000' }),
}

export const boxShadows: Rule<Theme>[] = [
  // shadow
  [/^shadow(?:-(.+))?$/, handleShadow('shadow'), { autocomplete: ['shadow-$colors', 'shadow-$shadow'] }],
  [/^shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],

  // inset shadow
  [/^inset-shadow(?:-(.+))?$/, handleShadow('insetShadow'), { autocomplete: ['inset-shadow-$colors', 'inset-shadow-$insetShadow'] }],
  [/^inset-shadow-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-inset-shadow-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'shadow-(op|opacity)-<percent>' }],
]

function handleShadow(themeKey: 'shadow' | 'insetShadow') {
  return (match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | (CSSValueInput | string)[] | undefined => {
    const [, d] = match
    const { theme } = ctx
    const v = theme[themeKey]?.[d || 'DEFAULT']
    const c = d ? h.bracket.cssvar(d) : undefined
    const shadowVar = hyphenate(themeKey)

    if ((v != null || c != null) && !hasParseableColor(c, theme)) {
      return [
        {
          [`--un-${shadowVar}`]: colorableShadows((v || c)!, `--un-${shadowVar}-color`).join(','),
          'box-shadow': 'var(--un-inset-shadow), var(--un-inset-ring-shadow), var(--un-ring-offset-shadow), var(--un-ring-shadow), var(--un-shadow)',
        },
        ...Object.values(shadowProperties),
      ]
    }
    return colorResolver(`--un-${shadowVar}-color`, shadowVar)(match, ctx)
  }
}
