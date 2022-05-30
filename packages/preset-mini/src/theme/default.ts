import { colors } from './colors'
import { fontFamily, fontSize, letterSpacing, lineHeight, textIndent, textShadow, textStrokeWidth, wordSpacing } from './font'
import { borderRadius, boxShadow, breakpoints, duration, easing, lineWidth, ringWidth, spacing, verticalBreakpoints } from './misc'
import { blur, dropShadow } from './filters'
import { height, maxHeight, maxWidth, width } from './size'
import type { Theme } from './types'
import { preflightBase } from './preflight'

export const theme: Theme = {
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
}
