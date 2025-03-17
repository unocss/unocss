import type { Arrayable } from '@unocss/core'
import { toArray } from '@unocss/core'

export const PRESET_NAME = '@unocss/preset-wind4'

/** Keys will not appear in the theme variable. */
export const passThemeKey = ['DEFAULT', 'none']

export const trackedTheme = new Set<string>([])

export function themeTracking(key: Arrayable<string>) {
  for (const k of toArray(key)) {
    if (!trackedTheme.has(k)) {
      trackedTheme.add(k)
    }
  }
}
