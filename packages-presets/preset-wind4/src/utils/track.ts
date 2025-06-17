import type { Arrayable } from '@unocss/core'
import type { Theme } from '../theme/types'
import { toArray } from '@unocss/core'
import { getThemeByKey } from './utilities'

// region Theme
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

export function detectThemeValue(value: string, theme: Theme) {
  if (value.startsWith('var(')) {
    const variable = value.match(/var\(--([\w-]+)(?:,.*)?\)/)?.[1]
    if (variable) {
      const [key, ...path] = variable.split('-')
      const themeValue = getThemeByKey(theme, key as keyof Theme, path)

      if (typeof themeValue === 'string') {
        themeTracking(key, path)
        detectThemeValue(themeValue, theme)
      }
    }
  }
}
// endregion

// region Properties
export const trackedProperties = new Map<string, string>()
export function propertyTracking(property: string, value: string) {
  if (!trackedProperties.has(property)) {
    trackedProperties.set(property, value)
  }
}
// endregion
