import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { globalKeywords, h, makeGlobalStaticRules } from '../utils'

function resolveTransitionProperty(prop: string, theme: Theme): string | undefined {
  let p: string | undefined

  if (h.cssvar(prop) != null) {
    p = h.cssvar(prop)
  }
  else {
    if ((prop.startsWith('[') && prop.endsWith(']'))) {
      prop = prop.slice(1, -1)
    }
    const props = prop.split(',').map(p => theme.property?.[p] ?? h.properties(p))
    if (props.every(Boolean)) {
      p = props.join(',')
    }
  }

  return p
}

export const transitions: Rule<Theme>[] = [
  // transition
  [
    /^transition(?:-(\D+?))?(?:-(\d+))?$/,
    ([, prop, d], { theme }) => {
      const defaultTransition = {
        'transition-property': theme.property?.DEFAULT,
        'transition-timing-function': `var(--un-ease, var(--default-transition-timing-function))`,
        'transition-duration': `var(--un-duration, var(--default-transition-duration))`,
      }

      if (!prop && !d) {
        return {
          ...defaultTransition,
        }
      }

      else if (prop != null) {
        const p = resolveTransitionProperty(prop, theme)

        if (p) {
          return {
            '--un-duration': d && h.time(d),
            ...defaultTransition,
            'transition-property': p,
          }
        }
      }

      else if (d != null) {
        return {
          '--un-duration': h.time(d),
          ...defaultTransition,
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
    ([, d]) => ({
      '--un-duration': h.bracket.cssvar.time(d),
      'transition-duration': h.bracket.cssvar.time(d),
    }),
    { autocomplete: ['transition-duration-$duration', 'duration-$duration'] },
  ],

  [
    /^(?:transition-)?delay-(.+)$/,
    ([, d]) => ({ 'transition-delay': h.bracket.cssvar.time(d) }),
    { autocomplete: ['transition-delay-$duration', 'delay-$duration'] },
  ],

  [
    /^(?:transition-)?ease-(.+)$/,
    ([, d], { theme }) => {
      const v = d in (theme.ease ?? {}) ? `var(--ease-${d})` : h.bracket.cssvar(d)

      return {
        '--un-ease': v,
        'transition-timing-function': v,
      }
    },
    { autocomplete: ['transition-ease-(linear|in|out|in-out)', 'ease-(linear|in|out|in-out)'] },
  ],

  // props
  [
    /^(?:transition-)?property-(.+)$/,
    ([, v], { theme }) => {
      const p = h.global(v) || resolveTransitionProperty(v, theme)
      if (p)
        return { 'transition-property': p }
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

  // behavior
  ['transition-discrete', { 'transition-behavior': 'allow-discrete' }],
  ['transition-normal', { 'transition-behavior': 'normal' }],
]
