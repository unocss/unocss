import type { Theme } from './types'

// keep in ASC order: container.ts and breakpoints.ts need that order
export const breakpoints = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
} satisfies Theme['breakpoints']

export const verticalBreakpoints = { ...breakpoints } satisfies Theme['breakpoints']

export const lineWidth = {
  DEFAULT: '1px',
  none: '0',
} satisfies Theme['lineWidth']

export const spacing = {
  'DEFAULT': '1rem',
  'none': '0',
  'xs': '0.75rem',
  'sm': '0.875rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
} satisfies Theme['spacing']

export const duration = {
  DEFAULT: '150ms',
  none: '0s',
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} satisfies Theme['duration']

export const borderRadius = {
  'DEFAULT': '0.25rem',
  'none': '0',
  'sm': '0.125rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  'full': '9999px',
} satisfies Theme['borderRadius']

export const boxShadow = {
  'DEFAULT': ['var(--un-shadow-inset) 0 1px 3px 0 rgb(0 0 0 / 0.1)', 'var(--un-shadow-inset) 0 1px 2px -1px rgb(0 0 0 / 0.1)'],
  'none': '0 0 rgb(0 0 0 / 0)',
  'sm': 'var(--un-shadow-inset) 0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'md': ['var(--un-shadow-inset) 0 4px 6px -1px rgb(0 0 0 / 0.1)', 'var(--un-shadow-inset) 0 2px 4px -2px rgb(0 0 0 / 0.1)'],
  'lg': ['var(--un-shadow-inset) 0 10px 15px -3px rgb(0 0 0 / 0.1)', 'var(--un-shadow-inset) 0 4px 6px -4px rgb(0 0 0 / 0.1)'],
  'xl': ['var(--un-shadow-inset) 0 20px 25px -5px rgb(0 0 0 / 0.1)', 'var(--un-shadow-inset) 0 8px 10px -6px rgb(0 0 0 / 0.1)'],
  '2xl': 'var(--un-shadow-inset) 0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} satisfies Theme['boxShadow']

export const easing = {
  'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'linear': 'linear',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
} satisfies Theme['easing']

export const ringWidth = {
  DEFAULT: '1px',
  none: '0',
} satisfies Theme['ringWidth']

export const zIndex = {
  auto: 'auto',
}

export const media = {
  mouse: '(hover) and (pointer: fine)',
}
