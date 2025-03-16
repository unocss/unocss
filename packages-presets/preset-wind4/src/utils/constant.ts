/** Keys will not appear in the theme variable. */
export const passThemeKey = ['DEFAULT', 'none']

export const trackedTheme = new Set<string>([])

export function themeTracking(key: string) {
  if (!trackedTheme.has(key)) {
    trackedTheme.add(key)
  }
}
