import type { Theme } from './types'

export const font = {
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
} satisfies Theme['font']

export const text = {
  'xs': { fontSize: '0.75rem', lineHeight: '1rem' },
  'sm': { fontSize: '0.875rem', lineHeight: '1.25rem' },
  'base': { fontSize: '1rem', lineHeight: '1.5rem' },
  'lg': { fontSize: '1.125rem', lineHeight: '1.75rem' },
  'xl': { fontSize: '1.25rem', lineHeight: '1.75rem' },
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
  '5xl': { fontSize: '3rem', lineHeight: '1' },
  '6xl': { fontSize: '3.75rem', lineHeight: '1' },
  '7xl': { fontSize: '4.5rem', lineHeight: '1' },
  '8xl': { fontSize: '6rem', lineHeight: '1' },
  '9xl': { fontSize: '8rem', lineHeight: '1' },
} satisfies Theme['text']

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
} satisfies Theme['fontWeight']

export const tracking = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} satisfies Theme['tracking']

export const leading = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} satisfies Theme['leading']

export const textStrokeWidth: Theme['textStrokeWidth'] = {
  DEFAULT: '1.5rem',
  none: '0',
  sm: 'thin',
  md: 'medium',
  lg: 'thick',
} satisfies Theme['textStrokeWidth']
