import type { Rule } from '@unocss/core'
import { directionSize } from '@unocss/preset-mini/utils'
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
  ['snap-mandatory', { '--un-scroll-snap-strictness': 'mandatory' }],
  ['snap-proximity', { '--un-scroll-snap-strictness': 'proximity' }],
  ['snap-none', { 'scroll-snap-type': 'none' }],

  // snap align
  ['snap-start', { 'scroll-snap-align': 'start' }],
  ['snap-end', { 'scroll-snap-align': 'end' }],
  ['snap-center', { 'scroll-snap-align': 'center' }],
  ['snap-align-none', { 'scroll-snap-align': 'none' }],

  // snap stop
  ['snap-normal', { 'scroll-snap-stop': 'normal' }],
  ['snap-always', { 'scroll-snap-stop': 'always' }],

  // scroll margin
  [/^scroll-ma?()-?(-?.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([xy])-?(-?.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([rltb])-?(-?.+)$/, directionSize('scroll-margin')],

  // scroll padding
  [/^scroll-pa?()-?(-?.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([xy])-?(-?.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([rltb])-?(-?.+)$/, directionSize('scroll-padding')],
]
