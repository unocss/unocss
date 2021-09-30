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

export const defaultTheme: NanowindTheme = {
  colors,
  fontFamily,
  fontSize,
  breakpoints,
}
