import type { CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { getStringComponents } from '@unocss/rule-utils'
import { colorResolver, directionSize, h, hasParseableColor, isSize, parseColor } from '../utils'
import { splitComma } from '../utils/handlers/regex'
import { borderStyles } from './border'

const directions: Record<string, string[]> = {
  '': [''],
  'x': ['column-'],
  'y': ['row-'],
  'col': ['column-'],
  'row': ['row-'],
}
const directionFormatter = (p: string, i: string) => `${i}${p}`
export const gaps: Rule<Theme>[] = [
  [
    /^(?:flex-|grid-)?gap-?()(.+)$/,
    directionSize('gap', directions, directionFormatter),
    { autocomplete: ['gap-$spacing', 'gap-<num>'] },
  ],
  [
    /^(?:flex-|grid-)?gap-(col|row|x|y)-?(.+)$/,
    directionSize('gap', directions, directionFormatter),
    { autocomplete: ['gap-(col|row|x|y)-$spacing', 'gap-(col|row|x|y)-<num>'] },
  ],
]

const ruleDirections: Record<string, string> = {
  '': '',
  'x': 'row-',
  'y': 'column-',
  'col': 'column-',
  'row': 'row-',
}

export const gapRules: Rule<Theme>[] = [
  [
    /^rule(?:-(x|y|col|row))?-(.+)$/,
    handlerRule,
    { autocomplete: ['rule-$spacing', 'rule-<num>', 'rule-(x|y|col|row)-$spacing', 'rule-(x|y|col|row)-<num>'] },
  ],

  // rule size
  [
    /^rule(?:-(x|y|col|row))?(-width)?-(.+)$/,
    handlerRuleSize,
    { autocomplete: ['rule-$spacing', 'rule-<num>', 'rule-(x|y|col|row)-$spacing', 'rule-(x|y|col|row)-<num>'] },
  ],

  // rule color
  [
    /^rule(?:-(x|y|col|row))?(-color)?-(.+)$/,
    handlerRuleColor,
    { autocomplete: ['rule-$colors', 'rule-(x|y|col|row)-$colors'] },
  ],

  // rule opacity
  [
    /^rule(?:-(x|y|col|row))?-op(?:acity)?-?(.+)$/,
    ([, d = '', v]) => ({
      [`--un-${ruleDirections[d]}rule-opacity`]: h.bracket.percent(v),
    }),
    { autocomplete: ['rule-(op|opacity)-<percent>', 'rule-(x|y|col|row)-(op|opacity)-<percent>'] },
  ],

  // rule style
  [
    /^rule(?:-(x|y|col|row))?(?:-style)?-(.+)$/,
    handlerRuleStyle,
    { autocomplete: [`rule-style-(${borderStyles.join('|')})`, `rule-(x|y|col|row)-style-(${borderStyles.join(' | ')})`] },
  ],

  // rule break
  [
    /^rule(?:-(x|y|col|row))?-break-(normal|none|intersection)/,
    ([, d = '', v]) => ({
      [`${ruleDirections[d]}rule-break`]: v,
    }),
    { autocomplete: ['rule-break-(normal|none|intersection)', 'rule-(x|y|col|row)-break-(normal|none|intersection)'] },
  ],

  // rule visibility
  [
    /^rule(?:-(x|y|col|row))?-visibility-(normal|all|none|between|around)$/,
    ([, d = '', v]) => ({
      [`${ruleDirections[d]}rule-visibility-items`]: v,
    }),
    { autocomplete: ['rule-visibility-(normal|all|none|between)', 'rule-(x|y|col|row)-visibility-(normal|all|none|between)'] },
  ],

  // rule inset cap junction
  [
    /^rule(?:-(x|y|col|row))?-inset(?:-(cap|junction))?(?:-(start|end))?-(.+)$/,
    ([, d = '', kind, edge, v]) => {
      const p = ruleDirections[d]
      const value = h.bracket.cssvar.px(v)
      if (value != null) {
        return {
          [[p, 'rule', 'inset', kind, edge].filter(Boolean).join('-')]: value,
        }
      }
    },
    {
      autocomplete: [
        'rule-inset-<num>',
        'rule-inset-(start|end)-<num>',
        'rule-inset-(cap|junction)-<num>',
        'rule-inset-(cap|junction)-(start|end)-<num>',
        'rule-(x|y|col|row)-inset-<num>',
        'rule-(x|y|col|row)-inset-(start|end)-<num>',
        'rule-(x|y|col|row)-inset-(cap|junction)-<num>',
        'rule-(x|y|col|row)-inset-(cap|junction)-(start|end)-<num>',
      ],
    },
  ],

  // overlap
  ['rule-overlap-row', { 'rule-overlap': 'row-over-column' }],
  ['rule-overlap-column', { 'rule-overlap': 'column-over-row' }],
]

function handlerRuleStyle([, a = '', s]: string[]): CSSValueInput | undefined {
  const property = ruleProperty(a, 'style')
  if (property && borderStyles.includes(s)) {
    return {
      [property]: s,
    }
  }
}

function handlerRuleColor([, d = '', colorLabel, v]: string[], ctx: RuleContext<Theme>) {
  const property = ruleProperty(d, 'color')
  const varName = ruleProperty(d)
  if (!property || !varName)
    return

  const bracketColor = h.bracket(v)

  if (!colorLabel && hasRuleCSSVariable(bracketColor ?? v))
    return

  if (bracketColor == null)
    return colorResolver(property, varName)(['', v], ctx)

  const values = splitRuleValues(bracketColor)

  if (values.every(c => hasParseableColor(c, ctx.theme))) {
    return {
      [property]: values.map(c => parseColor(c, ctx.theme)!.color).join(','),
    }
  }
}

function handlerRuleSize([, d = '', widthLabel, s = '1']: string[], { theme }: RuleContext<Theme>): CSSValueInput | undefined {
  const property = ruleProperty(d, 'width')
  if (!property)
    return

  const v = h.bracket.cssvar.px(s, theme)

  if (!v)
    return

  const values = splitRuleValues(v).map(s => h.cssvar.px(s) ?? s)

  if (!widthLabel && values.some(isRuleCSSVariable))
    return

  if (values.every(s => isSize(s) || s.startsWith('var('))) {
    return {
      [property]: values.join(','),
    }
  }
}

function handlerRule([, d = '', v]: string[], { theme }: RuleContext<Theme>): CSSValueInput | undefined {
  const property = ruleProperty(d)
  const value = h.bracket.cssvar(v, theme)
  const shorthand = value && resolveRuleShorthand(value, theme)

  if (property && shorthand) {
    return {
      [property]: shorthand,
    }
  }
}

function ruleProperty(direction: string, suffix?: string) {
  const prefix = ruleDirections[direction]
  if (prefix == null)
    return
  return `${prefix}rule${suffix ? `-${suffix}` : ''}`
}

function splitRuleValues(value: string) {
  return value.split(splitComma).map(v => v.trim())
}

function isRuleCSSVariable(value: string) {
  return h.cssvar(value) != null
}

function hasRuleCSSVariable(value: string) {
  return splitRuleValues(value).some(isRuleCSSVariable)
}

function resolveRuleShorthand(value: string, theme: Theme) {
  const components = getStringComponents(value, ' ', 3)
  if (!components)
    return

  if (!value.startsWith('var(') && !components.some(c => borderStyles.includes(c)))
    return

  return components.map((c) => {
    if (hasParseableColor(c, theme)) {
      return parseColor(c, theme)!.color
    }
    return h.cssvar.px(c) ?? c
  }).join(' ')
}
