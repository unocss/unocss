import type { Preflight } from '@unocss/core'
import type { Theme } from '../theme'
import { trackedProperties } from '../utils/track'

export function properties(): Preflight<Theme> | undefined {
  return {
    getCSS: () => {
      if (trackedProperties.size > 0) {
        const parent = `@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b))))`
        const root = `*, ::before, ::after, ::backdrop`
        const css = Array.from(trackedProperties.entries())
          .map(([property, value]) => `${property}:${value};`)
          .join('')

        return `${parent}{${root}{${css}}}`
      }
    },
    layer: 'properties',
  }
}
