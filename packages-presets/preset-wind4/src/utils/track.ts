import type { Arrayable } from '@unocss/core'
import type { Theme } from '../theme/types'
import { toArray } from '@unocss/core'
import { getThemeByKey } from './utilities'

// Per-generator state, keyed by the resolved theme object: one theme per
// generator, rebuilt on every `setConfig`. Preflights read only this, so
// generators never share or clear each other's tracking state.

// region Theme
/**
 * Tracked theme keys of one generator.
 *
 * eg: colors:red-100
 *
 * @internal
 */
const trackedThemeByTheme = new WeakMap<Theme, Set<string>>()

export function getTrackedTheme(theme: Theme): Set<string> {
  let set = trackedThemeByTheme.get(theme)
  if (!set) {
    set = new Set()
    trackedThemeByTheme.set(theme, set)
  }
  return set
}

/**
 * Keys tracked by every generator in this process, exposed as
 * `preset.meta.themeDeps`. It merges all generators and cannot be split
 * per generator.
 *
 * @deprecated use `getTrackedTheme(theme)`
 */
export const trackedTheme = new Set<string>()

export function trackTheme(theme: Theme, key: string, props: Arrayable<string> = 'DEFAULT') {
  const tracked = `${key}:${toArray(props).join('-')}`
  trackedTheme.add(tracked)
  getTrackedTheme(theme).add(tracked)
}

/**
 * @deprecated No longer affects the generated CSS, it only feeds
 * `preset.meta.themeDeps`. Pass the generator's theme instead:
 * `trackTheme(theme, key, props)`.
 * @example
 * // before
 * themeTracking('colors', 'red-500')
 * // -> .text-red-500{color:var(--colors-red-500)}
 * //    but no --colors-red-500 in :root
 * // after, `theme` comes from the rule context
 * trackTheme(ctx.theme, 'colors', 'red-500')
 * // -> :root gets --colors-red-500 as well
 */
export function themeTracking(key: string, props: Arrayable<string> = 'DEFAULT') {
  trackedTheme.add(`${key}:${toArray(props).join('-')}`)
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
        trackTheme(theme, key, path)
        detectThemeValue(themeValue, theme)
      }
    }
  }
}
// endregion

// region Properties
/**
 * `@property` registrations of one generator, recorded when a
 * `defineProperty` value reaches the output.
 *
 * @internal
 */
const trackedPropertiesByTheme = new WeakMap<Theme, Map<string, string>>()

export function getTrackedProperties(theme: Theme): Map<string, string> {
  let map = trackedPropertiesByTheme.get(theme)
  if (!map) {
    map = new Map()
    trackedPropertiesByTheme.set(theme, map)
  }
  return map
}

/**
 * `@property` registrations of every generator in this process, exposed as
 * `preset.meta.propertyDeps`. It merges all generators and cannot be split
 * per generator.
 *
 * @deprecated use `getTrackedProperties(theme)`
 */
export const trackedProperties = new Map<string, string>()

export function trackProperty(theme: Theme, property: string, value: string) {
  if (!trackedProperties.has(property))
    trackedProperties.set(property, value)

  const tracked = getTrackedProperties(theme)
  if (!tracked.has(property))
    tracked.set(property, value)
}

/**
 * @deprecated No longer affects the generated CSS, it only feeds
 * `preset.meta.propertyDeps`. Pass the generator's theme instead:
 * `trackProperty(theme, property, value)`.
 * @example
 * // before
 * propertyTracking('--un-shadow', '0 0 #0000')
 * // -> .shadow{...} references var(--un-shadow)
 * //    but the @supports fallback never declares it
 * // after, `theme` comes from the rule context
 * trackProperty(ctx.theme, '--un-shadow', '0 0 #0000')
 * // -> the @supports fallback keeps the registration
 */
export function propertyTracking(property: string, value: string) {
  if (!trackedProperties.has(property))
    trackedProperties.set(property, value)
}
// endregion
