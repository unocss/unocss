import type { Rule } from '@unocss/core'
import { createKeywordRules } from '@unocss/preset-mini/utils'

export const mixBlendModes: Rule[] = [
  ...createKeywordRules('mix-blend', 'mix-blend-mode', [
    'color',
    'color-burn',
    'color-dodge',
    'color-light',
    'darken',
    'difference',
    'exclusion',
    'hue',
    'lighten',
    'luminosity',
    'multiply',
    'overlay',
    'saturation',
    'screen',
    'soft-light',
  ]),
  ['mix-blend-normal', { 'mix-blend-mode': 'normal' }],
]
