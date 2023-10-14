import { colors } from './colors'
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textIndent, textShadow, textStrokeWidth, wordSpacing } from './font'
import { borderRadius, boxShadow, breakpoints, duration, easing, lineWidth, media, ringWidth, spacing, verticalBreakpoints, zIndex } from './misc'
import { blur, dropShadow } from './filters'
import { containers, height, maxHeight, maxWidth, width } from './size'
import type { Theme } from './types'
import { preflightBase } from './preflight'

export const theme = {
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth: maxWidth,
  minHeight: maxHeight,
  inlineSize: width,
  blockSize: height,
  maxInlineSize: maxWidth,
  maxBlockSize: maxHeight,
  minInlineSize: maxWidth,
  minBlockSize: maxHeight,
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  breakpoints,
  verticalBreakpoints,
  borderRadius,
  lineHeight,
  letterSpacing,
  wordSpacing,
  boxShadow,
  textIndent,
  textShadow,
  textStrokeWidth,
  blur,
  dropShadow,
  easing,
  lineWidth,
  spacing,
  duration,
  ringWidth,
  preflightBase,
  containers,
  zIndex,
  media,
} satisfies Theme
