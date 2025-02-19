import type { Theme } from './types'
import { animation } from './animate'
import { colors } from './colors'
import { blur } from './filters'
import { font, fontWeight, leading, text, textStrokeWidth, tracking } from './font'
import { defaults, dropShadow, insetShadow, perspective, radius, shadow, spacing, textShadow } from './misc'
import { breakpoint, container, verticalBreakpoint } from './size'
import { ease, property } from './transition'

export const theme = {
  font,
  colors,
  spacing,
  breakpoint,
  verticalBreakpoint,
  container,
  text,
  fontWeight,
  tracking,
  leading,
  textStrokeWidth,
  radius,
  shadow,
  insetShadow,
  dropShadow,
  textShadow,
  ease,
  animation,
  blur,
  perspective,
  property,
  defaults,
} satisfies Theme
