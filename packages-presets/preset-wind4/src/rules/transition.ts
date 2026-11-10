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
    ([, prop, d], ctx) => {
      const { theme } = ctx

      themeTracking('default', ['transition', 'timingFunction'], ctx)
      themeTracking('default', ['transition', 'duration'], ctx)

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
    ([, d], ctx) => ({
      '--un-duration': h.bracket.cssvar.time(d, ctx),
      'transition-duration': h.bracket.cssvar.time(d, ctx),
    }),
  ],

  [
    /^(?:transition-)?delay-(.+)$/,
    ([, d], ctx) => ({ 'transition-delay': h.bracket.cssvar.time(d, ctx) }),
  ],

  [
    /^(?:transition-)?ease(?:-(.+))?$/,
    ([, d = 'DEFAULT'], ctx) => {
      const { theme } = ctx

      let v
      if (theme.ease?.[d]) {
        themeTracking('ease', d, ctx)
        v = generateThemeVariable('ease', d)
      }
      else {
        v = h.bracket.cssvar(d, ctx)
      }

      return [
        {
          '--un-ease': v,
          'transition-timing-function': v,
        },
        defineProperty('--un-ease', {}, ctx),
      ]
    },
    { autocomplete: ['transition-ease-(linear|in|out|in-out)', 'ease-(linear|in|out|in-out)'] },
  ],

  // props
  [
    /^(?:transition-)?property-(.+)$/,
    ([, v], ctx) => {
      const { theme } = ctx

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
