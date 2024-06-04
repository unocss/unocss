import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { globalKeywords, h, makeGlobalStaticRules } from '../utils'

const transitionPropertyGroup: Record<string, string> = {
  all: 'all',
  colors: ['color', 'background-color', 'border-color', 'outline-color', 'text-decoration-color', 'fill', 'stroke'].join(','),
  none: 'none',
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform',
}

function transitionProperty(prop: string): string | undefined {
  const props = prop.split(',').flatMap(p => h.properties(p) ?? transitionPropertyGroup[p])
  if (props.length > 0 && props.every(Boolean))
    return props.join(',')
}

export const transitions: Rule<Theme>[] = [
  // transition
  [
    /^transition(?:-([a-z-]+(?:,[a-z-]+)*))?(?:-(\d+))?$/,
    ([, prop, d], { theme }) => {
      const p = prop != null
        ? transitionProperty(prop)
        : [transitionPropertyGroup.colors, 'opacity', 'box-shadow', 'transform', 'filter', 'backdrop-filter'].join(',')
      if (p) {
        const duration = theme.duration?.[d || 'DEFAULT'] ?? h.time(d || '150')
        return {
          'transition-property': p,
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'transition-duration': duration,
        }
      }
    },
    { autocomplete: `transition-(${Object.keys(transitionPropertyGroup).join('|')})` },
  ],

  // timings
  [
    /^(?:transition-)?duration-(.+)$/,
    ([, d], { theme }) => ({ 'transition-duration': theme.duration?.[d || 'DEFAULT'] ?? h.bracket.cssvar.time(d) }),
    { autocomplete: ['transition-duration-$duration', 'duration-$duration'] },
  ],

  [
    /^(?:transition-)?delay-(.+)$/,
    ([, d], { theme }) => ({ 'transition-delay': theme.duration?.[d || 'DEFAULT'] ?? h.bracket.cssvar.time(d) }),
    { autocomplete: ['transition-delay-$duration', 'delay-$duration'] },
  ],

  [
    /^(?:transition-)?ease(?:-(.+))?$/,
    ([, d], { theme }) => ({ 'transition-timing-function': theme.easing?.[d || 'DEFAULT'] ?? h.bracket.cssvar(d) }),
    { autocomplete: ['transition-ease-(linear|in|out|in-out|DEFAULT)', 'ease-(linear|in|out|in-out|DEFAULT)'] },
  ],

  // props
  [
    /^(?:transition-)?property-(.+)$/,
    ([, v]) => ({ 'transition-property': h.bracket.global(v) || transitionProperty(v) }),
    { autocomplete: [`transition-property-(${[...globalKeywords, ...Object.keys(transitionPropertyGroup)].join('|')})`] },
  ],

  // none
  ['transition-none', { transition: 'none' }],
  ...makeGlobalStaticRules('transition'),
]
