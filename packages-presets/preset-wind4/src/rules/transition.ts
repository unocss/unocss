import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { defineProperty, generateThemeVariable, globalKeywords, h, makeGlobalStaticRules, themeTracking } from '../utils'

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
      themeTracking('default', ['transition', 'timingFunction'])
      themeTracking('default', ['transition', 'duration'])

      const defaultTransition = {
        'transition-property': theme.property?.DEFAULT,
        'transition-timing-function': `var(--un-ease, ${generateThemeVariable('default', ['transition', 'timingFunction'])})`,
        'transition-duration': `var(--un-duration, ${generateThemeVariable('default', ['transition', 'duration'])})`,
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
  ],

  // timings
  [
    /^(?:transition-)?duration-(.+)$/,
    ([, d]) => ({
      '--un-duration': h.bracket.cssvar.time(d),
      'transition-duration': h.bracket.cssvar.time(d),
    }),
  ],

  [
    /^(?:transition-)?delay-(.+)$/,
    ([, d]) => ({ 'transition-delay': h.bracket.cssvar.time(d) }),
  ],

  [
    /^(?:transition-)?ease(?:-(.+))?$/,
    ([, d = 'DEFAULT'], { theme }) => {
      let v
      if (theme.ease?.[d]) {
        themeTracking('ease', d)
        v = generateThemeVariable('ease', d)
      }
      else {
        v = h.bracket.cssvar(d)
      }

      return [
        {
          '--un-ease': v,
          'transition-timing-function': v,
        },
        defineProperty('--un-ease'),
      ]
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
    ] },
  ],

  // none
  ['transition-none', { transition: 'none' }],
  ...makeGlobalStaticRules('transition'),

  // behavior
  ['transition-discrete', { 'transition-behavior': 'allow-discrete' }],
  ['transition-normal', { 'transition-behavior': 'normal' }],
]
