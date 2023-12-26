import type { CSSObject, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h, isCSSMathFn } from '../utils'

export const svgUtilities: Rule<Theme>[] = [
  // fills
  [/^fill-(.+)$/, colorResolver('fill', 'fill', 'backgroundColor'), { autocomplete: 'fill-$colors' }],
  [/^fill-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-fill-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'fill-(op|opacity)-<percent>' }],
  ['fill-none', { fill: 'none' }],

  // stroke size
  [/^stroke-(?:width-|size-)?(.+)$/, handleWidth, { autocomplete: ['stroke-width-$lineWidth', 'stroke-size-$lineWidth'] }],

  // stroke dash
  [/^stroke-dash-(.+)$/, ([, s]) => ({ 'stroke-dasharray': h.bracket.cssvar.number(s) }), { autocomplete: 'stroke-dash-<num>' }],
  [/^stroke-offset-(.+)$/, ([, s], { theme }) => ({ 'stroke-dashoffset': theme.lineWidth?.[s] ?? h.bracket.cssvar.px.numberWithUnit(s) }), { autocomplete: 'stroke-offset-$lineWidth' }],

  // stroke colors
  [/^stroke-(.+)$/, handleColorOrWidth, { autocomplete: 'stroke-$colors' }],
  [/^stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-stroke-opacity': h.bracket.percent.cssvar(opacity) }), { autocomplete: 'stroke-(op|opacity)-<percent>' }],

  // line cap
  ['stroke-cap-square', { 'stroke-linecap': 'square' }],
  ['stroke-cap-round', { 'stroke-linecap': 'round' }],
  ['stroke-cap-auto', { 'stroke-linecap': 'butt' }],

  // line join
  ['stroke-join-arcs', { 'stroke-linejoin': 'arcs' }],
  ['stroke-join-bevel', { 'stroke-linejoin': 'bevel' }],
  ['stroke-join-clip', { 'stroke-linejoin': 'miter-clip' }],
  ['stroke-join-round', { 'stroke-linejoin': 'round' }],
  ['stroke-join-auto', { 'stroke-linejoin': 'miter' }],

  // none
  ['stroke-none', { stroke: 'none' }],
]

function handleWidth([, b]: string[], { theme }: RuleContext<Theme>): CSSObject {
  return { 'stroke-width': theme.lineWidth?.[b] ?? h.bracket.cssvar.fraction.px.number(b) }
}

function handleColorOrWidth(match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | undefined {
  if (isCSSMathFn(h.bracket(match[1])))
    return handleWidth(match, ctx)
  return colorResolver('stroke', 'stroke', 'borderColor')(match, ctx) as CSSObject | undefined
}
