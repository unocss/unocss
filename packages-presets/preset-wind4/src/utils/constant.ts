import type { Arrayable } from '@unocss/core'
import { toArray } from '@unocss/core'

export const PRESET_NAME = '@unocss/preset-wind4'

/**
 * Used to track theme keys.
 *
 * eg: colors:red-100
 *
 * @internal
 */
export const trackedTheme = new Set<string>([])

export function themeTracking(key: string, props: Arrayable<string> = 'DEFAULT') {
  const k = `${key}:${toArray(props).join('-')}`
  if (!trackedTheme.has(k)) {
    trackedTheme.add(k)
  }
}

export function generateThemeVariable(key: string, props: Arrayable<string>) {
  return `var(--${key}-${toArray(props).join('-')})`
}
