import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const transitionPropertyGroup: Record<string, string> = {
  all: 'all',
  colors: ['color', 'background-color', 'border-color', 'text-decoration-color', 'fill', 'stroke'].join(','),
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform',
}

const transitionProperty = (prop: string): string | undefined => {
  return h.properties(prop) ?? transitionPropertyGroup[prop]
}

export const transitions: Rule[] = [
  // transition
  [/^transition(?:-([a-z-]+(?:,[a-z-]+)*))?(?:-(\d+))?$/, ([, prop, duration = '150']) => {
    const p = prop != null
      ? transitionProperty(prop)
      : [transitionPropertyGroup.colors, 'opacity', 'box-shadow', 'transform', 'filter', 'backdrop-filter'].join(',')
    if (p) {
      return {
        'transition-property': p,
        'transition-timing-function': 'cubic-bezier(0.4,0,0.2,1)',
        'transition-duration': `${duration}ms`,
      }
    }
  }],

  // timings
  [/^(?:transition-)?delay-(.+)(?:s|ms)?$/, ([, d]) => ({ 'transition-delay': h.bracket.time(d) })],
  [/^(?:transition-)?duration-(.+)(?:s|ms)?$/, ([, d]) => ({ 'transition-duration': h.bracket.time(d) })],

  // timing functions
  [/^ease-(.+)$/, ([, d]) => ({ 'transition-timing-function': h.bracket(d) })],
  ['ease', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)' }],
  ['ease-linear', { 'transition-timing-function': 'linear' }],
  ['ease-in', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 1, 1)' }],
  ['ease-out', { 'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)' }],
  ['ease-in-out', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)' }],

  // props
  [/^(?:transition-)?property-(.+)$/, ([, v]) => ({ 'transition-property': h.global(v) || transitionProperty(v) })],

  // nones
  ['transition-property-none', { 'transition-property': 'none' }],
  ['property-none', { 'transition-property': 'none' }],
  ['transition-none', { transition: 'none' }],
]
