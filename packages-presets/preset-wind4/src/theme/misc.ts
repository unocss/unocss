import type { Theme } from './types'

export const spacing = {
  'DEFAULT': '0.25rem',
  'xs': 'calc(var(--spacing) * 3)',
  'sm': 'calc(var(--spacing) * 3.5)',
  'lg': 'calc(var(--spacing) * 4.5)',
  'xl': 'calc(var(--spacing) * 5)',
  '2xl': 'calc(var(--spacing) * 6)',
  '3xl': 'calc(var(--spacing) * 7.5)',
  '4xl': 'calc(var(--spacing) * 9)',
  '5xl': 'calc(var(--spacing) * 12)',
  '6xl': 'calc(var(--spacing) * 15)',
  '7xl': 'calc(var(--spacing) * 18)',
  '8xl': 'calc(var(--spacing) * 24)',
  '9xl': 'calc(var(--spacing) * 32)',
} satisfies Theme['spacing']

export const radius = {
  'DEFAULT': '0.25rem',
  'none': '0',
  'xs': '0.125rem',
  'sm': '0.25rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
} satisfies Theme['radius']

export const shadow = {
  'DEFAULT': [`var(--un-shadow-inset) 0 1px 3px 0 rgb(0 0 0 / 0.1)`, `var(--un-shadow-inset) 0 1px 2px -1px rgb(0 0 0 / 0.1)`],
  '2xs': `var(--un-shadow-inset) 0 1px rgb(0 0 0 / 0.05)`,
  'xs': `var(--un-shadow-inset) 0 1px 2px 0 rgb(0 0 0 / 0.05)`,
  'sm': [`var(--un-shadow-inset) 0 1px 3px 0 rgb(0 0 0 / 0.1)`, `var(--un-shadow-inset) 0 1px 2px -1px rgb(0 0 0 / 0.1)`],
  'md': [`var(--un-shadow-inset) 0 4px 6px -1px rgb(0 0 0 / 0.1)`, `var(--un-shadow-inset) 0 2px 4px -2px rgb(0 0 0 / 0.1)`],
  'lg': [`var(--un-shadow-inset) 0 10px 15px -3px rgb(0 0 0 / 0.1)`, `var(--un-shadow-inset) 0 4px 6px -4px rgb(0 0 0 / 0.1)`],
  'xl': [`var(--un-shadow-inset) 0 20px 25px -5px rgb(0 0 0 / 0.1)`, `var(--un-shadow-inset) 0 8px 10px -6px rgb(0 0 0 / 0.1)`],
  '2xl': `var(--un-shadow-inset) 0 25px 50px -12px rgb(0 0 0 / 0.25)`,
  'none': '0 0 rgb(0 0 0 / 0)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} satisfies Theme['shadow']

export const insetShadow = {
  'DEFAULT': 'inset 0 1px 1px rgb(0 0 0 / 0.05)',
  '2xs': 'inset 0 1px rgb(0 0 0 / 0.05)',
  'xs': 'inset 0 1px 1px rgb(0 0 0 / 0.05)',
  'sm': 'inset 0 2px 4px rgb(0 0 0 / 0.05)',
} satisfies Theme['insetShadow']

export const dropShadow = {
  'DEFAULT': ['0 1px 2px rgb(0 0 0 / 0.1)', '0 1px 1px rgb(0 0 0 / 0.06)'],
  'xs': '0 1px 1px rgb(0 0 0 / 0.05)',
  'sm': '0 1px 2px rgb(0 0 0 / 0.15)',
  'md': '0 3px 3px rgb(0 0 0 / 0.12)',
  'lg': '0 4px 4px rgb(0 0 0 / 0.15)',
  'xl': '0 9px 7px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 25px rgb(0 0 0 / 0.15)',
} satisfies Theme['dropShadow']

export const textShadow = {
  DEFAULT: ['0 0 1px rgb(0 0 0 / 0.2)', '0 0 1px rgb(1 0 5 / 0.1)'],
  none: '0 0 rgb(0 0 0 / 0)',
  sm: '1px 1px 3px rgb(36 37 47 / 0.25)',
  md: ['0 1px 2px rgb(30 29 39 / 0.19)', '1px 2px 4px rgb(54 64 147 / 0.18)'],
  lg: ['3px 3px 6px rgb(0 0 0 / 0.26)', '0 0 5px rgb(15 3 86 / 0.22)'],
  xl: ['1px 1px 3px rgb(0 0 0 / 0.29)', '2px 4px 7px rgb(73 64 125 / 0.35)'],
} satisfies Theme['textShadow']

export const perspective = {
  dramatic: '100px',
  near: '300px',
  normal: '500px',
  midrange: '800px',
  distant: '1200px',
} satisfies Theme['perspective']

export const defaults = {
  transition: {
    duration: '150ms',
  },
  font: {
    family: 'var(--font-sans)',
    featureSettings: 'var(--font-sans--font-feature-settings)',
    variationSettings: 'var(--font-sans--font-variation-settings)',
  },
  monoFont: {
    family: 'var(--font-mono)',
    featureSettings: 'var(--font-mono--font-feature-settings)',
    variationSettings: 'var(--font-mono--font-variation-settings)',
  },
}
