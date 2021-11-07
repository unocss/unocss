import { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const keyframes: any = {
  spin: '@keyframes spin {from {transform:rotate(0deg);} to {transform:rotate(360deg);}}',
  ping: '@keyframes ping {0% {transform:scale(1);opacity:1;} 75%, 100% {transform:scale(2);opacity:0;}}',
  pulse: '@keyframes pulse {0%, 100% {opacity:1;} 50% {opacity:.5;}}',
  bounce: '@keyframes bounce {0%, 100% {transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1);} 50% {transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1);}}',
}

// https://windicss.org/plugins/community/animations.html
export const animations: Rule[] = [
  [/^animate-(spin|ping|pulse|bounce)$/, ([, name], { constructCSS }) => `${keyframes[name]}\n${constructCSS({ animation: `${name} 1s linear infinite` })}`],
  ['animate-none', { animation: 'none' }],
  [/^animate(?:-duration)?-((.+)(?:(s|ms)?))$/, ([, d]) => ({ 'animation-duration': h.bracket.time(d.replace(/-duration/, '')) })],
  [/^animate-delay-((.+)(?:(s|ms)?))$/, ([, d]) => ({ 'animation-delay': h.bracket.time(d) })],
  [/^animate-(?:fill-)?mode-(none|forwards|backwards|both|inherit|initial|revert|unset)$/, ([, d]) => ({ 'animation-fill-mode': d })],
  [/^animate-(?:direction-)?(normal|reverse|alternate|alternate-reverse|inherit|initial|revert|unset)$/, ([, d]) => ({ 'animation-direction': d })],
  [/^animate-(?:iteration-)?count-(.+)$/, ([, d]) => ({ 'animation-iteration-count': d.replace(/\-/g, ', ') })],
  [/^animate-name-(.+)/, ([, d]) => ({ 'animation-name': d })],
  [/^animate-play(?:-state)?-(paused|running|inherit|initial|revert|unset)$/, ([, d]) => ({ 'animation-play-state': d })],
]
