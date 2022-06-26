import type { Rule } from '@unocss/core'
import { globalKeywords, handler as h, makeGlobalStaticRules, positionMap } from '@unocss/preset-mini/utils'

export const textTransforms: Rule[] = [
  // tailwind compat
  ['uppercase', { 'text-transform': 'uppercase' }],
  ['lowercase', { 'text-transform': 'lowercase' }],
  ['capitalize', { 'text-transform': 'capitalize' }],
  ['normal-case', { 'text-transform': 'none' }],
]

export const hyphens: Rule[] = [
  ...['manual', 'auto', 'none', ...globalKeywords].map(keyword => [`hyphens-${keyword}`, {
    '-webkit-hyphens': keyword,
    '-ms-hyphens': keyword,
    'hyphens': keyword,
  }] as Rule),
]

export const writingModes: Rule[] = [
  ['write-vertical-right', { 'writing-mode': 'vertical-rl' }],
  ['write-vertical-left', { 'writing-mode': 'vertical-lr' }],
  ['write-normal', { 'writing-mode': 'horizontal-tb' }],
  ...makeGlobalStaticRules('write', 'writing-mode'),
]

export const writingOrientations: Rule[] = [
  ['write-orient-mixed', { 'text-orientation': 'mixed' }],
  ['write-orient-sideways', { 'text-orientation': 'sideways' }],
  ['write-orient-upright', { 'text-orientation': 'upright' }],
  ...makeGlobalStaticRules('write-orient', 'text-orientation'),
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
  ['isolation-auto', { isolation: 'auto' }],
]

export const objectPositions: Rule[] = [
  // object fit
  ['object-cover', { 'object-fit': 'cover' }],
  ['object-contain', { 'object-fit': 'contain' }],
  ['object-fill', { 'object-fit': 'fill' }],
  ['object-scale-down', { 'object-fit': 'scale-down' }],
  ['object-none', { 'object-fit': 'none' }],

  // object position
  [/^object-(.+)$/, ([, d]) => {
    if (positionMap[d])
      return { 'object-position': positionMap[d] }
    if (h.bracketOfPosition(d) != null)
      return { 'object-position': h.bracketOfPosition(d)!.split(' ').map(e => h.position.fraction.auto.px.cssvar(e)).join(' ') }
  }, { autocomplete: `object-(${Object.keys(positionMap).join('|')})` }],

]

export const backgroundBlendModes: Rule[] = [
  ['bg-blend-multiply', { 'background-blend-mode': 'multiply' }],
  ['bg-blend-screen', { 'background-blend-mode': 'screen' }],
  ['bg-blend-overlay', { 'background-blend-mode': 'overlay' }],
  ['bg-blend-darken', { 'background-blend-mode': 'darken' }],
  ['bg-blend-lighten', { 'background-blend-mode': 'lighten' }],
  ['bg-blend-color-dodge', { 'background-blend-mode': 'color-dodge' }],
  ['bg-blend-color-burn', { 'background-blend-mode': 'color-burn' }],
  ['bg-blend-hard-light', { 'background-blend-mode': 'hard-light' }],
  ['bg-blend-soft-light', { 'background-blend-mode': 'soft-light' }],
  ['bg-blend-difference', { 'background-blend-mode': 'difference' }],
  ['bg-blend-exclusion', { 'background-blend-mode': 'exclusion' }],
  ['bg-blend-hue', { 'background-blend-mode': 'hue' }],
  ['bg-blend-saturation', { 'background-blend-mode': 'saturation' }],
  ['bg-blend-color', { 'background-blend-mode': 'color' }],
  ['bg-blend-luminosity', { 'background-blend-mode': 'luminosity' }],
  ['bg-blend-normal', { 'background-blend-mode': 'normal' }],
  ...makeGlobalStaticRules('bg-blend', 'background-blend'),
]

export const mixBlendModes: Rule[] = [
  ['mix-blend-multiply', { 'mix-blend-mode': 'multiply' }],
  ['mix-blend-screen', { 'mix-blend-mode': 'screen' }],
  ['mix-blend-overlay', { 'mix-blend-mode': 'overlay' }],
  ['mix-blend-darken', { 'mix-blend-mode': 'darken' }],
  ['mix-blend-lighten', { 'mix-blend-mode': 'lighten' }],
  ['mix-blend-color-dodge', { 'mix-blend-mode': 'color-dodge' }],
  ['mix-blend-color-burn', { 'mix-blend-mode': 'color-burn' }],
  ['mix-blend-hard-light', { 'mix-blend-mode': 'hard-light' }],
  ['mix-blend-soft-light', { 'mix-blend-mode': 'soft-light' }],
  ['mix-blend-difference', { 'mix-blend-mode': 'difference' }],
  ['mix-blend-exclusion', { 'mix-blend-mode': 'exclusion' }],
  ['mix-blend-hue', { 'mix-blend-mode': 'hue' }],
  ['mix-blend-saturation', { 'mix-blend-mode': 'saturation' }],
  ['mix-blend-color', { 'mix-blend-mode': 'color' }],
  ['mix-blend-luminosity', { 'mix-blend-mode': 'luminosity' }],
  ['mix-blend-plus-lighter', { 'mix-blend-mode': 'plus-lighter' }],
  ['mix-blend-normal', { 'mix-blend-mode': 'normal' }],
  ...makeGlobalStaticRules('mix-blend'),
]
