import type { Rule } from '@unocss/core'
import { handler as h } from '@unocss/preset-mini/utils'
import type { Theme } from '@unocss/preset-mini'

export const animations: Rule<Theme>[] = [
  [/^keyframes-(.+)$/, ([, name], { theme, constructCSS }) => {
    const kf = theme.animation?.keyframes?.[name]
    if (kf)
      return `@keyframes ${name}${kf}\n${constructCSS({ animation: `${name}` })}`
  }],

  [/^animate-(.+)$/, ([, name], { theme, constructCSS }) => {
    const kf = theme.animation?.keyframes?.[name]
    if (kf) {
      const duration = theme.animation?.durations?.[name] ?? '1s'
      const timing = theme.animation?.timingFns?.[name] ?? 'linear'
      const props = theme.animation?.properties?.[name]
      return `@keyframes ${name}${kf}\n${constructCSS(
        Object.assign({ animation: `${name} ${duration} ${timing} infinite` }, props))}`
    }
    return { animate: h.bracket.cssvar(name) }
  }],

  // timings
  [/^animate-duration-(.+)$/, ([, d]) => ({ 'animation-duration': h.bracket.cssvar.time(d) })],
  [/^animate-delay-(.+)$/, ([, d]) => ({ 'animation-delay': h.bracket.cssvar.time(d) })],
  [/^animate-ease-(.+)$/, ([, d]) => ({ 'animation-timing-function': h.bracket.cssvar(d) })],

  // fill mode
  [/^animate-(?:fill-)?mode-(forwards|backwards|both|inherit|initial|revert|unset)$/, ([, d]) => ({ 'animation-fill-mode': d })],
  ['animate-mode-none', { 'animation-fill-mode': 'none' }],
  ['animate-fill-mode-none', { 'animation-fill-mode': 'none' }],

  // direction
  [/^animate-(?:direction-)?(reverse|alternate|alternate-reverse|inherit|initial|revert|unset)$/, ([, d]) => ({ 'animation-direction': d })],
  ['animate-normal', { 'animation-direction': 'normal' }],
  ['animate-direction-normal', { 'animation-direction': 'normal' }],

  // others
  [/^animate-(?:iteration-)?count-(.+)$/, ([, d]) => ({ 'animation-iteration-count': h.bracket.cssvar(d) ?? d.replace(/\-/g, ',') })],
  [/^animate-name-(.+)/, ([, d]) => ({ 'animation-name': d })],
  [/^animate-play-(?:state-)?(paused|running|inherit|initial|revert|unset)$/, ([, d]) => ({ 'animation-play-state': d })],
  ['animate-none', { animation: 'none' }],
]
