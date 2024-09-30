import type { Theme } from './types'

export const easing = {
  'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'linear': 'linear',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
} satisfies Theme['easing']

export const transitionProperty = {
  none: 'none',
  all: 'all',
  colors: ['color', 'background-color', 'border-color', 'text-decoration-color', 'fill', 'stroke'].join(','),
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform',
  get DEFAULT() {
    return [this.colors, 'opacity', 'box-shadow', 'transform', 'filter', 'backdrop-filter'].join(',')
  },
} satisfies Theme['transitionProperty']
