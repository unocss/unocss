import type { Rule } from '@unocss/core'
import { createKeywordRules } from '@unocss/preset-mini/utils'

export const textTransforms: Rule[] = [
  // tailwind compact
  ['uppercase', { 'text-transform': 'uppercase' }],
  ['lowercase', { 'text-transform': 'lowercase' }],
  ['capitalize', { 'text-transform': 'capitalize' }],
  ['normal-case', { 'text-transform': 'none' }],
]

export const hyphens: Rule[] = [
  ['hyphens-none', {
    '-webkit-hyphens': 'none',
    '-ms-hyphens': 'none',
    'hyphens': 'none',
  }],
  ['hyphens-manual', {
    '-webkit-hyphens': 'manual',
    '-ms-hyphens': 'manual',
    'hyphens': 'manual',
  }],
  ['hyphens-auto', {
    '-webkit-hyphens': 'auto',
    '-ms-hyphens': 'auto',
    'hyphens': 'auto',
  }],
]

export const writingModes: Rule[] = [
  ...createKeywordRules('write', 'writing-mode', [
    ['normal', 'horizontal-tb'],
    ['vertical-right', 'vertical-rl'],
    ['vertical-left', 'vertical-lr'],
  ]),
]

export const writingOrientations: Rule[] = [
  ...createKeywordRules('write-orient', 'text-orientation', [
    'mixed',
    'upright',
    'sideways',
  ]),
]

export const screenReadersAccess: Rule[] = [
  [
    'sr-only', {
      'position': 'absolute',
      'width': '1px',
      'height': '1px',
      'padding': '0',
      'margin': '-1px',
      'overflow': 'hidden',
      'clip': 'rect(0,0,0,0)',
      'white-space': 'nowrap',
      'border-width': 0,
    },
  ],
  [
    'not-sr-only',
    {
      'position': 'static',
      'width': 'auto',
      'height': 'auto',
      'padding': '0',
      'margin': '0',
      'overflow': 'visible',
      'clip': 'auto',
      'white-space': 'normal',
    },
  ],
]

export const isolations: Rule[] = [
  ['isolate', { isolation: 'isolate' }],
  ['isolate-auto', { isolation: 'auto' }],
]

export const objectPositions: Rule[] = [
  // object fit
  ...createKeywordRules('object', 'object-fit', [
    'contain',
    'cover',
    'fill',
    'scale-down',
  ]),
  ['object-none', { 'object-fit': 'none' }],

  // object position
  ...createKeywordRules('object', 'object-position', [
    'bottom',
    'center',
    'left',
    'right',
    'top',
    ['cb', 'center bottom'],
    ['ct', 'center top'],
    ['lb', 'left bottom'],
    ['lt', 'left top'],
    ['rb', 'right bottom'],
    ['rt', 'right top'],
  ]),
]
