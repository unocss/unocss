import type { Rule } from '@unocss/core'
import { colorResolver, handler as h } from '../utils'

export const svgUtilities: Rule[] = [
  // fills
  [/^fill-(.+)$/, colorResolver('fill', 'fill')],
  [/^fill-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-fill-opacity': h.bracket.percent(opacity) })],
  ['fill-none', { fill: 'none' }],

  // stroke size
  [/^stroke-(?:size-|width-)?(.+)$/, ([, s]) => ({ 'stroke-width': h.bracket.fraction.px.number(s) })],

  // stroke colors
  [/^stroke-(.+)$/, colorResolver('stroke', 'stroke')],
  [/^stroke-op(?:acity)?-?(.+)$/, ([, opacity]) => ({ '--un-stroke-opacity': h.bracket.percent(opacity) })],
  ['stroke-none', { stroke: 'none' }],
]
