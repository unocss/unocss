import type { Rule } from '@unocss/core'
import { createKeywordRules, directionSize } from '@unocss/preset-mini/utils'
import { CONTROL_BYPASS_PSEUDO_CLASS } from '@unocss/preset-mini/variants'

export const scrolls: Rule[] = [
  // snap type
  [/^snap-(x|y|base)$/, ([, d]) => [
    {
      '--un-scroll-snap-strictness': 'proximity',
      [CONTROL_BYPASS_PSEUDO_CLASS]: '',
    },
    {
      'scroll-snap-type': `${d} var(--un-scroll-snap-strictness)`,
    },
  ]],
  ...createKeywordRules('snap', '--un-scroll-snap-strictness', [
    'mandatory',
    'proximity',
  ]),
  ['snap-none', { 'scroll-snap-type': 'none' }],

  // snap align
  ...createKeywordRules('snap', 'scroll-snap-align', [
    'center',
    'end',
    'start',
  ]),
  ['snap-align-none', { 'scroll-snap-align': 'none' }],

  // snap stop
  ...createKeywordRules('snap', 'scroll-snap-stop', [
    'always',
    'normal',
  ]),

  // scroll margin
  [/^scroll-ma?()-?(-?.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([xy])-?(-?.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([rltb])-?(-?.+)$/, directionSize('scroll-margin')],

  // scroll padding
  [/^scroll-pa?()-?(-?.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([xy])-?(-?.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([rltb])-?(-?.+)$/, directionSize('scroll-padding')],
]
