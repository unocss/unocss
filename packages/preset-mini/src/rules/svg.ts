import type { Rule } from '@unocss/core'
import { createColorAndOpacityRulePair, sizePxResolver } from '../utils'

export const svgUtilities: Rule[] = [
  // fills
  ...createColorAndOpacityRulePair('fill'),
  ['fill-none', { fill: 'none' }],

  // stroke size
  [/^stroke-(?:size-|width-)?(.+)$/, sizePxResolver('stroke-width')],

  // stroke colors
  ...createColorAndOpacityRulePair('stroke'),
  ['stroke-none', { stroke: 'none' }],
]
