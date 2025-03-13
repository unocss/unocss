import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { defineProperty, directionSize } from '../utils'

export const scrolls: Rule<Theme>[] = [
  // snap type
  [/^snap-(x|y|both)$/, function* ([, d]) {
    yield {
      'scroll-snap-type': `${d} var(--un-scroll-snap-strictness)`,
    }
    yield defineProperty('--un-scroll-snap-strictness', { initialValue: 'proximity' })
  }, { autocomplete: 'snap-(x|y|both)' }],

  [/^snap-(mandatory|proximity)$/, function* ([, d]) {
    yield {
      '--un-scroll-snap-strictness': d,
    }
    yield defineProperty('--un-scroll-snap-strictness', { initialValue: 'proximity' })
  }, { autocomplete: 'snap-(mandatory|proximity)' }],
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

  [/^scroll-ma?()-?(.+)$/, directionSize('scroll-margin'), {
    autocomplete: [
      'scroll-(m|p|ma|pa|block|inline)',
      'scroll-(m|p|ma|pa|block|inline)-$spacing',
      'scroll-(m|p|ma|pa|block|inline)-(x|y|r|l|t|b|bs|be|is|ie)',
      'scroll-(m|p|ma|pa|block|inline)-(x|y|r|l|t|b|bs|be|is|ie)-$spacing',
    ],
  }],
  [/^scroll-m-?([xy])-?(.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([rltb])-?(.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-(block|inline)-(.+)$/, directionSize('scroll-margin')],
  [/^scroll-m-?([bi][se])-?(.+)$/, directionSize('scroll-margin')],

  // scroll padding

  [/^scroll-pa?()-?(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([xy])-?(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([rltb])-?(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-(block|inline)-(.+)$/, directionSize('scroll-padding')],
  [/^scroll-p-?([bi][se])-?(.+)$/, directionSize('scroll-padding')],
]
