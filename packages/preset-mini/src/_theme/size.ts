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
}

export const maxWidth = {
  none: 'none',
  ...baseSize,
  screen: '100vw',
}

export const height = {
  auto: 'auto',
  ...baseSize,
  screen: '100vh',
}

export const maxHeight = {
  none: 'none',
  ...baseSize,
  screen: '100vh',
}
