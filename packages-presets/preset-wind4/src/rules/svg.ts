import type { CSSObject, CSSValueInput, Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { colorResolver, h, isSize } from '../utils'

export const svgUtilities: Rule<Theme>[] = [
  // fills
  [/^fill-(.+)$/, colorResolver('fill', 'fill'), { autocomplete: 'fill-$colors' }],
  [/^fill-op(?:acity)?-?(.+)$/, ([, opacity], ctx) => ({ '--un-fill-opacity': h.bracket.percent.cssvar(opacity, ctx) }), { autocomplete: 'fill-(op|opacity)-<percent>' }],
  ['fill-none', { fill: 'none' }],

  // stroke size
  [/^stroke-(?:width-|size-)?(.+)$/, handleWidth],

  // stroke dash
  [/^stroke-dash-(.+)$/, ([, s], ctx) => ({ 'stroke-dasharray': h.bracket.cssvar.number(s, ctx) }), { autocomplete: 'stroke-dash-<num>' }],
  [/^stroke-offset-(.+)$/, ([, s], ctx) => ({ 'stroke-dashoffset': h.bracket.cssvar.px.numberWithUnit(s, ctx) })],

  // stroke colors
  [/^stroke-(.+)$/, handleColorOrWidth, { autocomplete: 'stroke-$colors' }],
  [/^stroke-op(?:acity)?-?(.+)$/, ([, opacity], ctx) => ({ '--un-stroke-opacity': h.bracket.percent.cssvar(opacity, ctx) }), { autocomplete: 'stroke-(op|opacity)-<percent>' }],

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

function handleWidth([, b]: string[], ctx: RuleContext<Theme>): CSSObject {
  return { 'stroke-width': h.bracket.cssvar.fraction.px.number(b, ctx) }
}

function handleColorOrWidth(match: RegExpMatchArray, ctx: RuleContext<Theme>): CSSObject | (CSSValueInput | string)[] | undefined {
  if (isSize(match[1]))
    return handleWidth(match, ctx)
  return colorResolver('stroke', 'stroke')(match, ctx)
}
