import { Rule, RuleContext } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'

export const sizes: Rule[] = [
  ['w-full', { width: '100%' }],
  ['h-full', { height: '100%' }],
  ['w-screen', { width: '100vw' }],
  ['h-screen', { height: '100vh' }],
  [/^w-([^-]+)$/, ([, s]) => ({ width: h.bracket.fraction.rem(s) })],
  [/^h-([^-]+)$/, ([, s]) => ({ height: h.bracket.fraction.rem(s) })],
  [/^max-w-([^-]+)$/, ([, s]) => ({ 'max-width': h.bracket.fraction.rem(s) })],
  [/^max-h-([^-]+)$/, ([, s]) => ({ 'max-height': h.bracket.fraction.rem(s) })],
  [/^max-w-screen-([a-z]+)$/, ([, s], { theme }: RuleContext<Theme>) => {
    const v = theme.breakpoints?.[s]
    if (v != null)
      return { 'max-width': v }
  }],
]
