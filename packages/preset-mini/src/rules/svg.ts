import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'
import { colorResolver } from './color'

export const svgUtilities: Rule[] = [
  // fills
  [/^fill-(.+)$/, colorResolver('fill', 'fill')],
  [/^fill-op(?:acity)?-?(.+)$/m, ([, opacity]) => ({ '--un-fill-opacity': h.bracket.percent(opacity) })],
  ['fill-none', { fill: 'none' }],

  // stroke size
  [/^stroke-(?:size-|width-)?(.+)$/, ([, s]) => {
    const v = h.bracket.fraction.px.number(s)
    if (v)
      return { 'stroke-width': v }
  }],

  // stroke colors
  [/^stroke-(.+)$/, colorResolver('stroke', 'stroke')],
  [/^stroke-op(?:acity)?-?(.+)$/m, ([, opacity]) => ({ '--un-stroke-opacity': h.bracket.percent(opacity) })],
  ['stroke-none', { stroke: 'none' }],
]
