export interface ThemeAnimation {
  keyframes?: Record<string, string>
  durations?: Record<string, string>
  timingFns?: Record<string, string>
  properties?: Record<string, object>
  counts?: Record<string, string | number>
}

export interface Theme {
  width?: Record<string, string>
  height?: Record<string, string>
  maxWidth?: Record<string, string>
  maxHeight?: Record<string, string>
  minWidth?: Record<string, string>
  minHeight?: Record<string, string>
  inlineSize?: Record<string, string>
  blockSize?: Record<string, string>
  maxInlineSize?: Record<string, string>
  maxBlockSize?: Record<string, string>
  minInlineSize?: Record<string, string>
  minBlockSize?: Record<string, string>
  borderRadius?: Record<string, string>
  breakpoints?: Record<string, string>
  verticalBreakpoints?: Record<string, string>
  colors?: Record<string, string | Record<string, string>>
  fontFamily?: Record<string, string>
  fontSize?: Record<string, [string, string]>
  lineHeight?: Record<string, string>
  letterSpacing?: Record<string, string>
  wordSpacing?: Record<string, string>
  boxShadow?: Record<string, string | string[]>
  textIndent?: Record<string, string>
  textShadow?: Record<string, string | string[]>
  textStrokeWidth?: Record<string, string>
  ringWidth?: Record<string, string>
  lineWidth?: Record<string, string>
  spacing?: Record<string, string>
  duration?: Record<string, string>
  // filters
  blur?: Record<string, string>
  dropShadow?: Record<string, string | string[]>
  // transitions
  easing?: Record<string, string>
  // media queries
  media?: Record<string, string>
  // animation
  animation?: ThemeAnimation
  // grids
  gridAutoColumn?: Record<string, string>
  gridAutoRow?: Record<string, string>
  gridColumn?: Record<string, string>
  gridRow?: Record<string, string>
  gridTemplateColumn?: Record<string, string>
  gridTemplateRow?: Record<string, string>
  // vars
  /** Used to generate CSS variables placeholder in preflight */
  preflightBase?: Record<string, string | number>
}
