import type { Rule } from '@unocss/core'
import { handler as h } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

export const animations: Rule<Theme>[] = [
  [/^(?:animate-)?keyframes-(.+)$/, ([, name], { theme, constructCSS }) => {
    const kf = theme.animation?.keyframes?.[name]
    if (kf)
      return `@keyframes ${name}${kf}\n${constructCSS({ animation: `${name}` })}`
  }, { autocomplete: ['animate-keyframes-$animation.keyframes', 'keyframes-$animation.keyframes'] }],

  [/^animate-(.+)$/, ([, name], { theme, constructCSS }) => {
    const kf = theme.animation?.keyframes?.[name]
    if (kf) {
      const duration = theme.animation?.durations?.[name] ?? '1s'
      const timing = theme.animation?.timingFns?.[name] ?? 'linear'
      const props = theme.animation?.properties?.[name]
      return `@keyframes ${name}${kf}\n${constructCSS(
        Object.assign({ animation: `${name} ${duration} ${timing} infinite` }, props))}`
    }
    return { animation: h.bracket.cssvar(name) }
  }, { autocomplete: 'animate-$animation.keyframes' }],
  [/^animate-name-(.+)/, ([, d]) => ({ 'animation-name': h.bracket.cssvar(d) ?? d })],

  // timings
  [/^animate-duration-(.+)$/, ([, d], { theme }) => ({ 'animation-duration': theme.duration?.[d || 'DEFAULT'] ?? h.bracket.cssvar.time(d) }), { autocomplete: ['animate-duration', 'animate-duration-$duration'] }],
  [/^animate-delay-(.+)$/, ([, d], { theme }) => ({ 'animation-delay': theme.duration?.[d || 'DEFAULT'] ?? h.bracket.cssvar.time(d) }), { autocomplete: ['animate-delay', 'animate-delay-$duration'] }],
  [/^animate-ease(?:-(.+))?$/, ([, d], { theme }) => ({ 'animation-timing-function': theme.easing?.[d || 'DEFAULT'] ?? h.bracket.cssvar(d) }), { autocomplete: 'animate-delay-$easing' }],

  // fill mode
  [/^animate-(?:fill-|mode-|fill-mode-)?(none|forwards|backwards|both|inherit|initial|revert|revert-layer|unset)$/, ([, d]) => ({ 'animation-fill-mode': d }),
    {
      autocomplete: [
        'animate-(fill|mode|fill-mode)',
        'animate-(fill|mode|fill-mode)-(none|forwards|backwards|both|inherit|initial|revert|revert-layer|unset)',
        'animate-(none|forwards|backwards|both|inherit|initial|revert|revert-layer|unset)',
      ],
    },
  ],

  // direction
  [/^animate-(?:direction-)?(normal|reverse|alternate|alternate-reverse|inherit|initial|revert|revert-layer|unset)$/, ([, d]) => ({ 'animation-direction': d }),
    {
      autocomplete: [
        'animate-direction',
        'animate-direction-(normal|reverse|alternate|alternate-reverse|inherit|initial|revert|revert-layer|unset)',
        'animate-(normal|reverse|alternate|alternate-reverse|inherit|initial|revert|revert-layer|unset)',
      ],
    },
  ],

  // others
  [/^animate-(?:iteration-|count-|iteration-count-)(.+)$/, ([, d]) => ({ 'animation-iteration-count': h.bracket.cssvar(d) ?? d.replace(/\-/g, ',') }), { autocomplete: ['animate-(iteration|count|iteration-count)', 'animate-(iteration|count|iteration-count)-<num>'] }],
  [/^animate-(?:play-|state-|play-state-)?(paused|running|inherit|initial|revert|revert-layer|unset)$/, ([, d]) => ({ 'animation-play-state': d }),
    {
      autocomplete: [
        'animate-(play|state|play-state)',
        'animate-(play|state|play-state)-(paused|running|inherit|initial|revert|revert-layer|unset)',
        'animate-(paused|running|inherit|initial|revert|revert-layer|unset)',
      ],
    }],
  ['animate-none', { animation: 'none' }],
]
