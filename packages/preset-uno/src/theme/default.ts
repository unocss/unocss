import { colors } from './colors'
import { fontFamily, fontSize, letterSpacing, lineHeight, textIndent, textStrokeWidth, textShadow, wordSpacing } from './font'
import { breakpoints, borderRadius, boxShadow } from './misc'
import { blur, dropShadow } from './filters'
import { width, height, maxWidth, maxHeight } from './size'
import { Theme } from './types'

export * from './colors'

export const theme: Theme = {
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth: maxWidth,
  minHeight: maxHeight,
  colors,
  fontFamily,
  fontSize,
  breakpoints,
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
}
