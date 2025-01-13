import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h } from '../utils'

export const flex: Rule<Theme>[] = [
  // display
  ['flex', { display: 'flex' }],
  ['inline-flex', { display: 'inline-flex' }],
  ['flex-inline', { display: 'inline-flex' }],

  // flex
  [/^flex-(.*)$/, ([, d]) => ({ flex: h.bracket(d) != null ? h.bracket(d)!.split(' ').map(e => h.cssvar.fraction(e) ?? e).join(' ') : h.cssvar.fraction(d) })],
  ['flex-1', { flex: '1 1 0%' }],
  ['flex-auto', { flex: '1 1 auto' }],
  ['flex-initial', { flex: '0 1 auto' }],
  ['flex-none', { flex: 'none' }],

  // shrink/grow/basis
  [/^(?:flex-)?shrink(?:-(.*))?$/, ([, d = '']) => ({ 'flex-shrink': h.bracket.cssvar.number(d) ?? 1 }), { autocomplete: ['flex-shrink-<num>', 'shrink-<num>'] }],
  [/^(?:flex-)?grow(?:-(.*))?$/, ([, d = '']) => ({ 'flex-grow': h.bracket.cssvar.number(d) ?? 1 }), { autocomplete: ['flex-grow-<num>', 'grow-<num>'] }],
  [/^(?:flex-)?basis-(.+)$/, ([, d], { theme }) => ({ 'flex-basis': theme.spacing?.[d] ?? h.bracket.cssvar.auto.fraction.rem(d) }), { autocomplete: ['flex-basis-$spacing', 'basis-$spacing'] }],

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
