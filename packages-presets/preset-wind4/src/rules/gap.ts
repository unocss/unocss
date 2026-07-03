import type { CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, directionSize, h, isCSSMathFn } from '../utils'
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
    /^rule(?:-(x|y|col|row))?-(.+)/,
    ([, d = '', v]) => ({
      [`${ruleDirections[d]}rule`]: h.bracket(v),
    }),
    { autocomplete: ['rule-$spacing', 'rule-<num>', 'rule-(x|y|col|row)-$spacing', 'rule-(x|y|col|row)-<num>'] },
  ],

  // rule size
  [
    /^rule(?:-(x|y|col|row))?(?:-width)?-(.+)/,
    handlerRuleSize,
    { autocomplete: ['rule-$spacing', 'rule-<num>', 'rule-(x|y|col|row)-$spacing', 'rule-(x|y|col|row)-<num>'] },
  ],

  // rule color
  [
    /^rule(?:-(x|y|col|row))?(?:-color)?-(.+)$/,
    handlerRuleColorOrSize,
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
  if (borderStyles.includes(s) && a in ruleDirections) {
    return {
      [`${ruleDirections[a]}rule-style`]: s,
    }
  }
}

function handlerRuleColorOrSize(match: string[], ctx: RuleContext<Theme>) {
  const [, d = '', v] = match
  if (isCSSMathFn(h.bracket(v, ctx.theme)))
    return handlerRuleSize(['', d, v], ctx)

  return colorResolver(`${ruleDirections[d]}rule-color`, `${ruleDirections[d]}rule`)(['', v], ctx)
}

function handlerRuleSize([, a = '', b = '1']: string[], { theme }: RuleContext<Theme>): CSSValueInput | undefined {
  const v = h.bracket.bracketOfLength.cssvar.global.px(b, theme)
  if (a in ruleDirections && v != null) {
    return {
      [`${ruleDirections[a]}rule-width`]: v,
    }
  }
}
