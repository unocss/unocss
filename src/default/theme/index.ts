import { NanowindTheme } from '../..'
import { colors } from './colors'
import { fontFamily, fontSize } from './font'

export * from './colors'

export const breakpoints = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}

export const borderRadius = {
  'DEFAULT': '0.25rem',
  'none': '0px',
  'sm': '0.125rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  'full': '9999px',
}

export const defaultTheme: NanowindTheme = {
  colors,
  fontFamily,
  fontSize,
  breakpoints,
  borderRadius,
}
