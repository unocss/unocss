import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { globalKeywords, h, makeGlobalStaticRules } from '../utils'

function resolveTransitionProperty(prop: string, theme: Theme): string | undefined {
  let p: string | undefined

  if (h.cssvar(prop) != null) {
    p = h.cssvar(prop)
  }
  else if ((prop.startsWith('[') && prop.endsWith(']'))) {
    const props = h.bracket(prop)
    if (props != null)
      p = props.split(' ').map(p => theme.transitionProperty?.[p] ?? p).join(',')
  }
  else {
    p = prop.split(',').map(p => theme.transitionProperty?.[p]).filter(Boolean).join(',')
  }

  return p
}

export const transitions: Rule<Theme>[] = [
  // transition
  [
    /^transition(?:-(\D+?))?(?:-(\d+))?$/,
    ([, prop, d], { theme }) => {
      if (!prop && !d) {
        return {
          'transition-property': theme.transitionProperty?.DEFAULT,
          'transition-timing-function': theme.easing?.DEFAULT,
          'transition-duration': theme.duration?.DEFAULT ?? h.time('150'),
        }
      }

      else if (prop != null) {
        const p = resolveTransitionProperty(prop, theme)
        const duration = theme.duration?.[d || 'DEFAULT'] ?? h.time(d || '150')

        if (p) {
          return {
            'transition-property': p,
            'transition-timing-function': theme.easing?.DEFAULT,
            'transition-duration': duration,
          }
        }
      }

      else if (d != null) {
        return {
          'transition-duration': theme.duration?.[d] ?? h.time(d),
          'transition-property': theme.transitionProperty?.DEFAULT,
          'transition-timing-function': theme.easing?.DEFAULT,
        }
      }
    },
    {
      autocomplete: 'transition-$transitionProperty-$duration',
    },
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
    ([, v], { theme }) => {
      return { 'transition-property': h.global(v) || resolveTransitionProperty(v, theme) }
    },
    { autocomplete: [
      `transition-property-(${[...globalKeywords].join('|')})`,
      'transition-property-$transitionProperty',
      'property-$transitionProperty',
    ] },
  ],

  // none
  ['transition-none', { transition: 'none' }],
  ...makeGlobalStaticRules('transition'),
]
