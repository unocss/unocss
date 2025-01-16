import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, globalKeywords, h, isCSSMathFn } from '../utils'

const decorationStyles = ['solid', 'double', 'dotted', 'dashed', 'wavy', ...globalKeywords]

export const textDecorations: Rule<Theme>[] = [
  [/^(?:decoration-)?(underline|overline|line-through)$/, ([, s]) => ({ 'text-decoration-line': s }), { autocomplete: 'decoration-(underline|overline|line-through)' }],

  // size
  [/^(?:underline|decoration)-(?:size-)?(.+)$/, handleWidth, { autocomplete: '(underline|decoration)-<num>' }],
  [/^(?:underline|decoration)-(auto|from-font)$/, ([, s]) => ({ 'text-decoration-thickness': s }), { autocomplete: '(underline|decoration)-(auto|from-font)' }],

  // colors
  [/^(?:underline|decoration)-(.+)$/, handleColorOrWidth, { autocomplete: '(underline|decoration)-$colors' }],
  [/^(?:underline|decoration)-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-line-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: '(underline|decoration)-(op|opacity)-<percent>' }],

  // offset
  [/^(?:underline|decoration)-offset-(.+)$/, ([, s], { theme }) => ({ 'text-underline-offset': theme.lineWidth?.[s] ?? h.auto.bracket.cssvar.global.px(s) }), { autocomplete: '(underline|decoration)-(offset)-<num>' }],

  // style
  ...decorationStyles.map(v => [`underline-${v}`, { 'text-decoration-style': v }] as Rule<Theme>),
  ...decorationStyles.map(v => [`decoration-${v}`, { 'text-decoration-style': v }] as Rule<Theme>),
  ['no-underline', { 'text-decoration': 'none' }],
  ['decoration-none', { 'text-decoration': 'none' }],
]

function handleWidth([, b]: string[], { theme }: RuleContext<Theme>): CSSObject {
  return { 'text-decoration-thickness': theme.lineWidth?.[b] ?? h.bracket.cssvar.global.px(b) }
}

function handleColorOrWidth(match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | undefined {
  if (isCSSMathFn(h.bracket(match[1])))
    return handleWidth(match, ctx)

  const result = colorResolver('text-decoration-color', 'line', 'borderColor')(match, ctx) as CSSObject | undefined
  if (result) {
    return {
      '-webkit-text-decoration-color': result['text-decoration-color'],
      ...result,
    }
  }
}
