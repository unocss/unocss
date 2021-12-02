
export interface Theme {
  width?: Record<string, string>
  height?: Record<string, string>
  maxWidth?: Record<string, string>
  maxHeight?: Record<string, string>
  minWidth?: Record<string, string>
  minHeight?: Record<string, string>
  borderRadius?: Record<string, string>
  breakpoints?: Record<string, string>
  colors?: Record<string, string | Record<string, string>>
  fontFamily?: Record<string, string>
  fontSize?: Record<string, [string, string]>
  lineHeight?: Record<string, string>
  letterSpacing?: Record<string, string>
  wordSpacing?: Record<string, string>
  boxShadow?: Record<string, string>
  textIndent?: Record<string, string>
  textShadow?: Record<string, string>
  textStrokeWidth?: Record<string, string>
  // filters
  blur?: Record<string, string>
  dropShadow?: Record<string, string | string[]>
}
