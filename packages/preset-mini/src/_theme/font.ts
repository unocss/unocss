import type { Theme } from './types'

export const fontFamily = {
  sans: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ].join(','),
  serif: [
    'ui-serif',
    'Georgia',
    'Cambria',
    '"Times New Roman"',
    'Times',
    'serif',
  ].join(','),
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ].join(','),
} satisfies Theme['fontFamily']

export const fontSize: Theme['fontSize'] = {
  'xs': ['0.75rem', '1rem'],
  'sm': ['0.875rem', '1.25rem'],
  'base': ['1rem', '1.5rem'],
  'lg': ['1.125rem', '1.75rem'],
  'xl': ['1.25rem', '1.75rem'],
  '2xl': ['1.5rem', '2rem'],
  '3xl': ['1.875rem', '2.25rem'],
  '4xl': ['2.25rem', '2.5rem'],
  '5xl': ['3rem', '1'],
  '6xl': ['3.75rem', '1'],
  '7xl': ['4.5rem', '1'],
  '8xl': ['6rem', '1'],
  '9xl': ['8rem', '1'],
} satisfies Theme['fontSize']

export const textIndent: Theme['textIndent'] = {
  'DEFAULT': '1.5rem',
  'xs': '0.5rem',
  'sm': '1rem',
  'md': '1.5rem',
  'lg': '2rem',
  'xl': '2.5rem',
  '2xl': '3rem',
  '3xl': '4rem',
} satisfies Theme['textIndent']

export const textStrokeWidth: Theme['textStrokeWidth'] = {
  DEFAULT: '1.5rem',
  none: '0',
  sm: 'thin',
  md: 'medium',
  lg: 'thick',
} satisfies Theme['textStrokeWidth']

export const textShadow = {
  DEFAULT: ['0 0 1px rgb(0 0 0 / 0.2)', '0 0 1px rgb(1 0 5 / 0.1)'],
  none: '0 0 rgb(0 0 0 / 0)',
  sm: '1px 1px 3px rgb(36 37 47 / 0.25)',
  md: ['0 1px 2px rgb(30 29 39 / 0.19)', '1px 2px 4px rgb(54 64 147 / 0.18)'],
  lg: ['3px 3px 6px rgb(0 0 0 / 0.26)', '0 0 5px rgb(15 3 86 / 0.22)'],
  xl: ['1px 1px 3px rgb(0 0 0 / 0.29)', '2px 4px 7px rgb(73 64 125 / 0.35)'],
} satisfies Theme['textShadow']

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} satisfies Theme['lineHeight']

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} satisfies Theme['letterSpacing']

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
  // int[0, 900] -> int
} satisfies Theme['fontWeight']

export const wordSpacing = letterSpacing satisfies Theme['letterSpacing']
