import type { Theme } from './types'

export const baseSize = {
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
}

export const width = {
  auto: 'auto',
  ...baseSize,
  screen: '100vw',
} satisfies Theme['width']

export const maxWidth = {
  none: 'none',
  ...baseSize,
  screen: '100vw',
} satisfies Theme['maxWidth']

export const blockSize = {
  auto: 'auto',
  ...baseSize,
  screen: '100vb',
} satisfies Theme['blockSize']

export const inlineSize = {
  auto: 'auto',
  ...baseSize,
  screen: '100vi',
} satisfies Theme['inlineSize']

export const height = {
  auto: 'auto',
  ...baseSize,
  screen: '100vh',
} satisfies Theme['height']

export const maxHeight = {
  none: 'none',
  ...baseSize,
  screen: '100vh',
} satisfies Theme['maxHeight']

export const maxBlockSize = {
  none: 'none',
  ...baseSize,
  screen: '100vb',
} satisfies Theme['maxBlockSize']

export const maxInlineSize = {
  none: 'none',
  ...baseSize,
  screen: '100vi',
} satisfies Theme['maxInlineSize']

export const containers = { ...baseSize } satisfies Theme['containers']
