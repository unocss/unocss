import type { Theme } from './types'
import { colors } from './colors'
import { blur, dropShadow } from './filters'
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textIndent, textShadow, textStrokeWidth, wordSpacing } from './font'
import { borderRadius, boxShadow, breakpoints, duration, lineWidth, media, ringWidth, spacing, verticalBreakpoints, zIndex } from './misc'
import { preflightBase } from './preflight'
import { blockSize, containers, height, inlineSize, maxBlockSize, maxHeight, maxInlineSize, maxWidth, width } from './size'
import { easing, transitionProperty } from './transition'

export const theme = {
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth: maxWidth,
  minHeight: maxHeight,
  inlineSize,
  blockSize,
  maxInlineSize,
  maxBlockSize,
  minInlineSize: maxInlineSize,
  minBlockSize: maxBlockSize,
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
  transitionProperty,
  lineWidth,
  spacing,
  duration,
  ringWidth,
  preflightBase,
  containers,
  zIndex,
  media,
} satisfies Theme
