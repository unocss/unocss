import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from '../utils'

const transitionPropertyGroup: Record<string, string> = {
  all: 'all',
  colors: ['color', 'background-color', 'border-color', 'text-decoration-color', 'fill', 'stroke'].join(','),
  none: 'none',
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform',
}

const transitionProperty = (prop: string): string | undefined => {
  return h.properties(prop) ?? transitionPropertyGroup[prop]
}

export const transitions: Rule<Theme>[] = [
  // transition
  [/^transition(?:-([a-z-]+(?:,[a-z-]+)*))?(?:-(\d+))?$/, ([, prop, duration = '150']) => {
    const p = prop != null
      ? transitionProperty(prop)
      : [transitionPropertyGroup.colors, 'opacity', 'box-shadow', 'transform', 'filter', 'backdrop-filter'].join(',')
    if (p) {
      return {
        'transition-property': p,
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': `${duration}ms`,
      }
    }
  }],

  // timings
  [/^(?:transition-)?duration-(.+)$/, ([, d]) => ({ 'transition-duration': h.bracket.cssvar.time(d) })],
  [/^(?:transition-)?delay-(.+)$/, ([, d]) => ({ 'transition-delay': h.bracket.cssvar.time(d) })],
  [/^(?:transition-)?ease(?:-(.+))?$/, ([, d], { theme }) => ({ 'transition-timing-function': theme.easing?.[d || 'DEFAULT'] ?? h.bracket.cssvar(d) })],

  // props
  [/^(?:transition-)?property-(.+)$/, ([, v]) => ({ 'transition-property': h.global(v) || transitionProperty(v) })],

  // none
  ['transition-none', { transition: 'none' }],
]
