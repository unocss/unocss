import type { Theme } from './types'

export const spacing = {
  'DEFAULT': '0.25rem',
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
  'DEFAULT': [`0 1px 3px 0 rgb(0 0 0 / 0.1)`, `0 1px 2px -1px rgb(0 0 0 / 0.1)`],
  '2xs': `0 1px rgb(0 0 0 / 0.05)`,
  'xs': `0 1px 2px 0 rgb(0 0 0 / 0.05)`,
  'sm': [`0 1px 3px 0 rgb(0 0 0 / 0.1)`, `0 1px 2px -1px rgb(0 0 0 / 0.1)`],
  'md': [`0 4px 6px -1px rgb(0 0 0 / 0.1)`, `0 2px 4px -2px rgb(0 0 0 / 0.1)`],
  'lg': [`0 10px 15px -3px rgb(0 0 0 / 0.1)`, `0 4px 6px -4px rgb(0 0 0 / 0.1)`],
  'xl': [`0 20px 25px -5px rgb(0 0 0 / 0.1)`, `0 8px 10px -6px rgb(0 0 0 / 0.1)`],
  '2xl': `0 25px 50px -12px rgb(0 0 0 / 0.25)`,
  'none': '0 0 rgb(0 0 0 / 0)',
  /* @deprecated see: https://github.com/tailwindlabs/tailwindcss/blob/bea843c90ab77b47622200daafb918f7044d9f88/packages/tailwindcss/theme.css#L458 */
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} satisfies Theme['shadow']

export const insetShadow = {
  '2xs': 'inset 0 1px rgb(0 0 0 / 0.05)',
  'xs': 'inset 0 1px 1px rgb(0 0 0 / 0.05)',
  'sm': 'inset 0 2px 4px rgb(0 0 0 / 0.05)',
  'none': '0 0 rgb(0 0 0 / 0)',
} satisfies Theme['insetShadow']

export const dropShadow = {
  /* @deprecated see: https://github.com/tailwindlabs/tailwindcss/blob/bea843c90ab77b47622200daafb918f7044d9f88/packages/tailwindcss/theme.css#L459 */
  'DEFAULT': ['0 1px 2px rgb(0 0 0 / 0.1)', '0 1px 1px rgb(0 0 0 / 0.06)'],
  'xs': '0 1px 1px rgb(0 0 0 / 0.05)',
  'sm': '0 1px 2px rgb(0 0 0 / 0.15)',
  'md': '0 3px 3px rgb(0 0 0 / 0.12)',
  'lg': '0 4px 4px rgb(0 0 0 / 0.15)',
  'xl': '0 9px 7px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 25px rgb(0 0 0 / 0.15)',
} satisfies Theme['dropShadow']

export const textShadow = {
  'none': '0 0 rgb(0 0 0 / 0)',
  '2xs': '0 1px 0 rgb(0 0 0 / 0.15)',
  'xs': '0 1px 1px rgb(0 0 0 / 0.2)',
  'sm': ['0 1px 0 rgb(0 0 0 / 0.075)', '0 1px 1px rgb(0 0 0 / 0.075)', '0 2px 2px rgb(0 0 0 / 0.075)'],
  'md': ['0 1px 1px rgb(0 0 0 / 0.1)', '0 1px 2px rgb(0 0 0 / 0.1)', '0 2px 4px rgb(0 0 0 / 0.1)'],
  'lg': ['0 1px 2px rgb(0 0 0 / 0.1)', '0 3px 2px rgb(0 0 0 / 0.1)', '0 4px 8px rgb(0 0 0 / 0.1)'],
} satisfies Theme['textShadow']

export const perspective = {
  dramatic: '100px',
  near: '300px',
  normal: '500px',
  midrange: '800px',
  distant: '1200px',
} satisfies Theme['perspective']

/** For reset css */
export const defaults = {
  transition: {
    duration: '150ms',
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
} satisfies Theme['default']
