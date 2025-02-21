export interface Colors {
  [key: string]: Colors | string
}

export interface ThemeAnimation {
  keyframes?: Record<string, string>
  durations?: Record<string, string>
  timingFns?: Record<string, string>
  properties?: Record<string, object>
  counts?: Record<string, string | number>
  category?: Record<string, string>
}

export interface Theme {
  font?: Record<string, string>
  colors?: Colors
  spacing?: Record<string, string>
  breakpoint?: Record<string, string>
  verticalBreakpoint?: Record<string, string>
  container?: Record<string, string>
  text: Record<string, { fontSize?: string, lineHeight?: string, letterSpacing?: string }>
  fontWeight?: Record<string, string>
  tracking?: Record<string, string>
  leading?: Record<string, string>
  radius?: Record<string, string>
  shadow?: Record<string, string | string[]>
  insetShadow?: Record<string, string | string[]>
  dropShadow?: Record<string, string | string[]>
  textShadow?: Record<string, string | string[]>
  ease?: Record<string, string>
  animate?: Record<string, string>
  blur?: Record<string, string>
  perspective?: Record<string, string>
  textStrokeWidth?: Record<string, string>
  property?: Record<string, string>
  defaults?: Record<string, Record<string, string>>

  animation?: ThemeAnimation
  duration?: Record<string, string>

  // container
  containers?: {
    center?: boolean
    padding?: string | Record<string, string>
    maxWidth?: Record<string, string>
  }

  // for variant
  aria?: Record<string, string>
  data?: Record<string, string>
  media?: Record<string, string>
  supports?: Record<string, string>
}
