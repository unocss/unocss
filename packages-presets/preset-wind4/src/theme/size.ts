import type { Theme } from './types'

export const container = {
  '3xs': '16rem',
  '2xs': '18rem',
  'xs': '20rem',
  'sm': '24rem',
  'md': '28rem',
  'lg': '32rem',
  'xl': '36rem',
  '2xl': '42rem',
  '3xl': '48rem',
  '4xl': '56rem',
  '5xl': '64rem',
  '6xl': '72rem',
  '7xl': '80rem',
  'prose': '65ch',
} satisfies Theme['container']

export const breakpoint = {
  'sm': '40rem',
  'md': '48rem',
  'lg': '64rem',
  'xl': '80rem',
  '2xl': '96rem',
} satisfies Theme['breakpoint']

export const verticalBreakpoint = { ...breakpoint } satisfies Theme['breakpoint']
