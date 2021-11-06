import { Rule, RuleContext } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'

export const sizes: Rule[] = [
  ['w-full', { width: '100%' }],
  ['h-full', { height: '100%' }],
  ['w-screen', { width: '100vw' }],
  ['h-screen', { height: '100vh' }],
  ['max-w-full', { 'max-height': '100%' }],
  ['min-h-full', { 'min-height': '100%' }],
  ['max-w-screen', { 'max-height': '100vw' }],
  ['min-h-screen', { 'min-height': '100vh' }],
  [/^(((min|max)-)?(w|h))-([^-]+)$/, ([, , , m, w, s]) => ({ [getPropName(m, w)]: h.bracket.fraction.rem(s) })],
  [/^(((min|max)-)?(w))-screen-([a-z]+)$/, ([, , , m, w, s], { theme }: RuleContext<Theme>) => {
    const v = theme.breakpoints?.[s]
    if (v != null)
      return { [getPropName(m, w)]: v }
  }],
]

function getPropName(minmax: string, hw: string) {
  const minMaxMap: Record<string, string> = {
    w: 'width',
    h: 'height',
    min: 'min-',
    max: 'max-',
  }

  return `${minMaxMap[minmax] ?? ''}${minMaxMap[hw]}`
}
