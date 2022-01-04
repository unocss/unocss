import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

export const flex: Rule[] = [
  // display
  ['flex', { display: 'flex' }],
  ['inline-flex', { display: 'inline-flex' }],
  ['flex-inline', { display: 'inline-flex' }],

  // flex
  ['flex-1', { flex: '1 1 0%' }],
  ['flex-auto', { flex: '1 1 auto' }],
  ['flex-initial', { flex: '0 1 auto' }],
  ['flex-none', { flex: 'none' }],
  [/^flex-(\[.+\])$/, ([, d]) => ({ flex: h.bracket(d)!.replace(/\d+\/\d+/, $1 => h.fraction($1)!) })],

  // shrink/grow/basis
  [/^(?:flex-)?shrink$/, () => ({ 'flex-shrink': 1 })],
  [/^(?:flex-)?shrink-0$/, () => ({ 'flex-shrink': 0 })],
  [/^(?:flex-)?grow$/, () => ({ 'flex-grow': 1 })],
  [/^(?:flex-)?grow-0$/, () => ({ 'flex-grow': 0 })],
  [/^(?:flex-)?basis-(.+)$/, ([, d]) => ({ 'flex-basis': h.bracket.fraction.auto.rem(d) })],

  // directions
  ['flex-row', { 'flex-direction': 'row' }],
  ['flex-row-reverse', { 'flex-direction': 'row-reverse' }],
  ['flex-col', { 'flex-direction': 'column' }],
  ['flex-col-reverse', { 'flex-direction': 'column-reverse' }],

  // wraps
  ['flex-wrap', { 'flex-wrap': 'wrap' }],
  ['flex-wrap-reverse', { 'flex-wrap': 'wrap-reverse' }],
  ['flex-nowrap', { 'flex-wrap': 'nowrap' }],
]
