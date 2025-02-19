import type { Theme } from './types'

export const ease = {
  'linear': 'linear',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
} satisfies Theme['ease']

export const property = {
  none: 'none',
  all: 'all',
  colors: ['color', 'background-color', 'border-color', 'text-decoration-color', 'fill', 'stroke', '--un-gradient-from', '--un-gradient-via', '--un-gradient-to'].join(','),
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: ['transform', 'translate', 'scale', 'rotate'].join(','),
  get DEFAULT() {
    return [this.colors, this.opacity, this.shadow, this.transform, 'filter', '-webkit-backdrop-filter', 'backdrop-filter'].join(',')
  },
} satisfies Theme['property']
