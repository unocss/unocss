import { colors } from './colors'
import { fontFamily, fontSize, letterSpacing, lineHeight, textIndent, textStrokeWidth } from './font'
import { breakpoints, borderRadius, textShadow } from './misc'
import { blur, dropShadow } from './filters'

export * from './colors'

export interface Theme {
  borderRadius?: Record<string, string>
  breakpoints?: Record<string, string>
  colors?: Record<string, string | Record<string, string>>
  fontFamily?: Record<string, string>
  fontSize?: Record<string, [string, string]>
  lineHeight?: Record<string, string>
  letterSpacing?: Record<string, string>
  textShadow?: Record<string, string>
  textIndent?: Record<string, string>
  textStrokeWidth?: Record<string, string>
  // filters
  blur?: Record<string, string>
  dropShadow?: Record<string, string | string[]>
}

export const theme: Theme = {
  colors,
  fontFamily,
  fontSize,
  breakpoints,
  borderRadius,
  lineHeight,
  letterSpacing,
  textShadow,
  textIndent,
  textStrokeWidth,
  blur,
  dropShadow,
}
