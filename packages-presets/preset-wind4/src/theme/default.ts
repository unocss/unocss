import type { Theme } from './types'
import { animation } from './animate'
import { aria } from './aria'
import { colors } from './colors'
import { blur } from './filters'
import { font, fontWeight, leading, text, textStrokeWidth, tracking } from './font'
import { media } from './media'
import { defaults, dropShadow, insetShadow, perspective, radius, shadow, spacing, textShadow } from './misc'
import { breakpoint, container, verticalBreakpoint } from './size'
import { supports } from './supports'
import { ease, property } from './transition'

export const theme = {
  // for rules
  font,
  colors,
  spacing,
  breakpoint,
  verticalBreakpoint,
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

  // for rules & variants
  container,

  // for variant
  aria,
  media,
  supports,
} satisfies Theme
