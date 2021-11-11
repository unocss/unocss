import { Rule, RuleContext } from '@unocss/core'
import { Theme } from '../theme'
import { handler as h } from '../utils'

function getPropName(minmax: string, hw: string) {
  const minMaxMap: Record<string, string> = {
    w: 'width',
    h: 'height',
  }
  return `${minmax ? `${minmax}-` : ''}${minMaxMap[hw]}`
}

export const sizes: Rule[] = [
  ['w-full', { width: '100%' }],
  ['h-full', { height: '100%' }],
  ['w-screen', { width: '100vw' }],
  ['h-screen', { height: '100vh' }],
  ['max-w-none', { 'max-width': 'none' }],
  ['max-w-full', { 'max-width': '100%' }],
  ['max-w-screen', { 'max-width': '100vw' }],
  ['min-w-none', { 'min-width': 'none' }],
  ['min-w-full', { 'min-width': '100%' }],
  ['min-w-screen', { 'min-width': '100vw' }],
  ['max-h-none', { 'max-height': 'none' }],
  ['max-h-full', { 'max-height': '100%' }],
  ['max-h-screen', { 'max-height': '100vh' }],
  ['min-h-none', { 'min-height': 'none' }],
  ['min-h-full', { 'min-height': '100%' }],
  ['min-h-screen', { 'min-height': '100vh' }],
  [/^(?:(min|max)-)?(w|h)-(.+)$/, ([, m, w, s]) => ({ [getPropName(m, w)]: h.bracket.cssvar.fraction.rem(s) })],
  [/^(?:(min|max)-)?(w)-screen-(.+)$/, ([, m, w, s], { theme }: RuleContext<Theme>) => {
    const v = theme.breakpoints?.[s]
    if (v != null)
      return { [getPropName(m, w)]: v }
  }],
]

export const aspectRatio: Rule[] = [
  ['aspect-ratio-auto', { 'aspect-ratio': 'auto' }],
  [/^aspect-ratio-(.+)$/, ([, d]: string[]) => {
    const v = (/^\d+\/\d+$/.test(d) ? d : null) || h.bracket.cssvar.number(d)
    if (v != null)
      return { 'aspect-ratio': v }
  }],
]
