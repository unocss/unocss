import type { Rule } from '@unocss/core'
import { globalKeywords, h, makeGlobalStaticRules } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

export const animations: Rule<Theme>[] = [
  [/^(?:animate-)?keyframes-(.+)$/, ([, name], { theme }) => {
    const kf = theme.animation?.keyframes?.[name]
    if (kf) {
      return [
        `@keyframes ${name}${kf}`,
        { animation: name },
      ]
    }
  }, { autocomplete: ['animate-keyframes-$animation.keyframes', 'keyframes-$animation.keyframes'] }],

  [/^animate-(.+)$/, ([, name], { theme }) => {
    const kf = theme.animation?.keyframes?.[name]
    if (kf) {
      const duration = theme.animation?.durations?.[name] ?? '1s'
      const timing = theme.animation?.timingFns?.[name] ?? 'linear'
      const count = theme.animation?.counts?.[name] ?? 1
      const props = theme.animation?.properties?.[name]
      return [
        `@keyframes ${name}${kf}`,
        {
          animation: `${name} ${duration} ${timing} ${count}`,
          ...props,
        },
      ]
    }
    return { animation: h.bracket.cssvar(name) }
  }, { autocomplete: 'animate-$animation.keyframes' }],
  [/^animate-name-(.+)/, ([, d]) => ({ 'animation-name': h.bracket.cssvar(d) ?? d })],

  // timings
  [/^animate-duration-(.+)$/, ([, d], { theme }) => ({ 'animation-duration': theme.duration?.[d || 'DEFAULT'] ?? h.bracket.cssvar.time(d) }), { autocomplete: ['animate-duration', 'animate-duration-$duration'] }],
  [/^animate-delay-(.+)$/, ([, d], { theme }) => ({ 'animation-delay': theme.duration?.[d || 'DEFAULT'] ?? h.bracket.cssvar.time(d) }), { autocomplete: ['animate-delay', 'animate-delay-$duration'] }],
  [/^animate-ease(?:-(.+))?$/, ([, d], { theme }) => ({ 'animation-timing-function': theme.easing?.[d || 'DEFAULT'] ?? h.bracket.cssvar(d) }), { autocomplete: ['animate-ease', 'animate-ease-$easing'] }],

  // fill mode
  [/^animate-(fill-mode-|fill-|mode-)?(.+)$/, ([, t, d]) => ['none', 'forwards', 'backwards', 'both', ...[t ? globalKeywords : []]].includes(d) ? { 'animation-fill-mode': d } : undefined, {
    autocomplete: [
      'animate-(fill|mode|fill-mode)',
      'animate-(fill|mode|fill-mode)-(none|forwards|backwards|both|inherit|initial|revert|revert-layer|unset)',
      'animate-(none|forwards|backwards|both|inherit|initial|revert|revert-layer|unset)',
    ],
  }],

  // direction
  [/^animate-(direction-)?(.+)$/, ([, t, d]) => ['normal', 'reverse', 'alternate', 'alternate-reverse', ...[t ? globalKeywords : []]].includes(d) ? { 'animation-direction': d } : undefined, {
    autocomplete: [
      'animate-direction',
      'animate-direction-(normal|reverse|alternate|alternate-reverse|inherit|initial|revert|revert-layer|unset)',
      'animate-(normal|reverse|alternate|alternate-reverse|inherit|initial|revert|revert-layer|unset)',
    ],
  }],

  // others
  [/^animate-(?:iteration-count-|iteration-|count-)(.+)$/, ([, d]) => ({ 'animation-iteration-count': h.bracket.cssvar(d) ?? d.replace(/-/g, ',') }), { autocomplete: ['animate-(iteration|count|iteration-count)', 'animate-(iteration|count|iteration-count)-<num>'] }],
  [/^animate-(play-state-|play-|state-)?(.+)$/, ([, t, d]) => ['paused', 'running', ...[t ? globalKeywords : []]].includes(d) ? { 'animation-play-state': d } : undefined, {
    autocomplete: [
      'animate-(play|state|play-state)',
      'animate-(play|state|play-state)-(paused|running|inherit|initial|revert|revert-layer|unset)',
      'animate-(paused|running|inherit|initial|revert|revert-layer|unset)',
    ],
  }],
  ['animate-none', { animation: 'none' }],
  ...makeGlobalStaticRules('animate', 'animation'),
]
