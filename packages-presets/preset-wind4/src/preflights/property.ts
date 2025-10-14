import type { Preflight } from '@unocss/core'
import type { PresetWind4Options } from '..'
import type { Theme } from '../theme'
import { trackedProperties } from '../utils/track'

export function property(options: PresetWind4Options): Preflight<Theme> | undefined {
  if (options.preflights?.property === false)
    return undefined

  const propertyConfig = typeof options.preflights?.property === 'object'
    ? options.preflights.property
    : undefined

  const parentSelector = propertyConfig?.parent !== undefined
    ? propertyConfig.parent
    : '@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b))))'

  const selector = propertyConfig?.selector
    ?? '*, ::before, ::after, ::backdrop'

  return {
    getCSS: () => {
      if (trackedProperties.size === 0)
        return

      const css = Array.from(trackedProperties.entries())
        .map(([property, value]) => `${property}:${value};`)
        .join('')

      return parentSelector === false
        ? `${selector}{${css}}`
        : `${parentSelector}{${selector}{${css}}}`
    },
    layer: 'properties',
  }
}
