import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const transitionProperty = (prop: string): string | undefined => {
  return h.properties(prop) || (prop === 'all' ? prop : undefined)
}

export const transitions: Rule[] = [
  [/^transition(?:-([a-z-]+(?:,[a-z-]+)*))?(?:-(\d+))?$/, ([, prop = 'all', duration = '150']) => {
    const p = transitionProperty(prop)
    if (p) {
      return {
        'transition-property': p,
        'transition-timing-function': 'cubic-bezier(0.4,0,0.2,1)',
        'transition-duration': `${duration}ms`,
      }
    }
  }],
  [/^duration-(\d+)$/, ([, duration = '150']) => ({ 'transition-duration': `${duration}ms` })],
  ['ease', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)' }],
  ['ease-linear', { 'transition-timing-function': 'linear' }],
  ['ease-in', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 1, 1)' }],
  ['ease-out', { 'transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)' }],
  ['ease-in-out', { 'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)' }],
  [/^transition-delay-(\d+)$/, ([, v]) => ({ 'transition-delay': `${v}ms` })],
  [/^transition-duration-(\d+)$/, ([, v]) => ({ 'transition-duration': `${v}ms` })],
  [/^(?:transition-)?property-(.+)$/, ([, v]) => ({ 'transition-property': h.global(v) || transitionProperty(v) })],

  // nones
  ['transition-property-none', { 'transition-property': 'none' }],
  ['property-none', { 'transition-property': 'none' }],
  ['transition-none', { transition: 'none' }],
]
