import { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const keyframes: any = {
  spin: '@keyframes spin {from {transform:rotate(0deg);} to {transform:rotate(360deg);}}',
  ping: '@keyframes ping {0% {transform:scale(1);opacity:1;} 75%, 100% {transform:scale(2);opacity:0;}}',
  pulse: '@keyframes pulse {0%, 100% {opacity:1;} 50% {opacity:.5;}}',
  bounce: '@keyframes bounce {0%, 100% {transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1);} 50% {transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1);}}',
}

// TODO: support custom speed, duration, delay
// https://windicss.org/plugins/community/animations.html
export const animations: Rule[] = [
  [/^animate-(none|spin|ping|pulse|bounce)$/, ([, name], { constructCSS }) => {
    return `${keyframes[name]}\n${constructCSS({ animation: `${name} 1s linear infinite` })}`
  }],
  ['animate-none', { animation: 'none' }],
  [/^animation(?:-duration)?-((\d+)(?:(s|ms)?))$/, ([, d]) => {
    return {
      'animation-duration': h.bracket.time(d.replace(/-duration/, '')),
    }
  }],
  [/^animation-delay-((\d+)(?:(s|ms)?))$/, ([, d]) => {
    return {
      'animation-delay': h.bracket.time(d),
    }
  }],
  [
    /^animation-(?:fill-)?mode-(.+)$/, ([, d]) => ({
      'animation-fill-mode': d.replace(/\-/g, ', '),
    }),
  ],
  [
    /^animation-(?:direction)?-(normal|reverse|alternate|alternate-reverse)$/, ([, d]) => ({
      'animation-direction': d,
    }),
  ],
  [
    /^animation-(?:iteration-)?count-(.+)$/, ([, d]) => {
      const value = d.replace(/\-/g, ', ')
      return {
        'animation-iteration-count': value,
      }
    },
  ],
  [
    /^animation-name-(.+)/, ([, d]) => ({
      'animation-name': d,
    }),
  ],
  [
    /^animation-play(?:-state)?-(paused|running|inherit|initial|revert|unset)$/, ([,d]) => ({
      'animation-play-state': d,
    })
  ]
]
