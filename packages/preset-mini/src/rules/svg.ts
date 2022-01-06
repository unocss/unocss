import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'

export const svgUtilities: Rule[] = [
  // fills
  [/^fill-(.+)$/, colorResolver('fill', 'fill')],
  [/^fill-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-fill-opacity': h.bracket.percent(opacity) })],
  ['fill-none', { fill: 'none' }],

  // stroke size
  [/^stroke-(?:size-|width-)?(.+)$/, ([, s]) => ({ 'stroke-width': h.bracket.fraction.px.number(s) })],

  // stroke dash
  [/^stroke-dash-(.+)$/, ([, s]) => ({ 'stroke-dasharray': h.bracket.number(s) })],
  [/^stroke-offset-(.+)$/, ([, s]) => ({ 'stroke-dashoffset': h.bracket.px.numberWithUnit(s) })],

  // stroke colors
  [/^stroke-(.+)$/, colorResolver('stroke', 'stroke')],
  [/^stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-stroke-opacity': h.bracket.percent(opacity) })],

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
