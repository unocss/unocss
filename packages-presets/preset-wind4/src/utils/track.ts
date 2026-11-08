import type { Arrayable } from '@unocss/core'
import type { Theme } from '../theme'
import type { ThemeInput, Wind4Context } from './context'
import { toArray } from '@unocss/core'
import { getTheme, getTrackingState, isContext } from './context'
import { getThemeByKey } from './utilities'

export type { ThemeInput, Wind4Context } from './context'

// region Theme
/**
 * Used to track theme keys.
 *
 * eg: colors:red-100
 *
 * @internal
 */
export const trackedTheme = new Set<string>([])

export function themeTracking(key: string, props: Arrayable<string> = 'DEFAULT', context?: Wind4Context) {
  const k = `${key}:${toArray(props).join('-')}`
  getTrackingState(context)?.themeDeps.add(k)
  if (!trackedTheme.has(k)) {
    trackedTheme.add(k)
  }
}

export function generateThemeVariable(key: string, props: Arrayable<string>) {
  return `var(--${key}-${toArray(props).join('-')})`
}

export function detectThemeValue(value: string, input: ThemeInput) {
  const theme = getTheme(input)
  if (value.startsWith('var(')) {
    const variable = value.match(/var\(--([\w-]+)(?:,.*)?\)/)?.[1]
    if (variable) {
      const [key, ...path] = variable.split('-')
      const themeValue = getThemeByKey(theme, key as keyof Theme, path)

      if (typeof themeValue === 'string') {
        themeTracking(key, path, isContext(input) ? input : undefined)
        detectThemeValue(themeValue, input)
      }
    }
  }
}
// endregion

// region Properties
export const trackedProperties = new Map<string, string>()
export function propertyTracking(property: string, value: string, context?: Wind4Context) {
  const properties = getTrackingState(context)?.propertyDeps
  if (properties && !properties.has(property))
    properties.set(property, value)
  if (!trackedProperties.has(property)) {
    trackedProperties.set(property, value)
  }
}
// endregion
