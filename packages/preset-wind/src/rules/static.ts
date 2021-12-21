import type { Rule } from '@unocss/core'

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
  ['write-normal', { 'writing-mode': 'horizontal-tb' }],
  ['write-vertical-right', { 'writing-mode': 'vertical-rl' }],
  ['write-vertical-left', { 'writing-mode': 'vertical-lr' }],
]

export const writingOrientations: Rule[] = [
  ['write-orient-mixed', { 'text-orientation': 'mixed' }],
  ['write-orient-upright', { 'text-orientation': 'upright' }],
  ['write-orient-sideways', { 'text-orientation': 'sideways' }],
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
  ['object-cover', { 'object-fit': 'cover' }],
  ['object-contain', { 'object-fit': 'contain' }],
  ['object-fill', { 'object-fit': 'fill' }],
  ['object-scale-down', { 'object-fit': 'scale-down' }],
  ['object-none', { 'object-fit': 'none' }],

  // object position
  ['object-center', { 'object-position': 'center' }],
  ['object-bottom', { 'object-position': 'bottom' }],
  ['object-top', { 'object-position': 'top' }],
  ['object-right', { 'object-position': 'right' }],
  ['object-left', { 'object-position': 'left' }],
  ['object-lb', { 'object-position': 'left bottom' }],
  ['object-lt', { 'object-position': 'left top' }],
  ['object-rb', { 'object-position': 'right bottom' }],
  ['object-rt', { 'object-position': 'right top' }],
  ['object-cb', { 'object-position': 'center bottom' }],
  ['object-ct', { 'object-position': 'center top' }],
]
