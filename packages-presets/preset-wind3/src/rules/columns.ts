import type { Rule } from '@unocss/core'
import { h, makeGlobalStaticRules } from '@unocss/preset-mini/utils'

export const columns: Rule[] = [
  [/^columns-(.+)$/, ([, v]) => ({ columns: h.bracket.global.number.auto.numberWithUnit(v) }), { autocomplete: 'columns-<num>' }],

  // break before
  ['break-before-auto', { 'break-before': 'auto' }],
  ['break-before-avoid', { 'break-before': 'avoid' }],
  ['break-before-all', { 'break-before': 'all' }],
  ['break-before-avoid-page', { 'break-before': 'avoid-page' }],
  ['break-before-page', { 'break-before': 'page' }],
  ['break-before-left', { 'break-before': 'left' }],
  ['break-before-right', { 'break-before': 'right' }],
  ['break-before-column', { 'break-before': 'column' }],
  ...makeGlobalStaticRules('break-before'),

  // break inside
  ['break-inside-auto', { 'break-inside': 'auto' }],
  ['break-inside-avoid', { 'break-inside': 'avoid' }],
  ['break-inside-avoid-page', { 'break-inside': 'avoid-page' }],
  ['break-inside-avoid-column', { 'break-inside': 'avoid-column' }],
  ...makeGlobalStaticRules('break-inside'),

  // break after
  ['break-after-auto', { 'break-after': 'auto' }],
  ['break-after-avoid', { 'break-after': 'avoid' }],
  ['break-after-all', { 'break-after': 'all' }],
  ['break-after-avoid-page', { 'break-after': 'avoid-page' }],
  ['break-after-page', { 'break-after': 'page' }],
  ['break-after-left', { 'break-after': 'left' }],
  ['break-after-right', { 'break-after': 'right' }],
  ['break-after-column', { 'break-after': 'column' }],
  ...makeGlobalStaticRules('break-after'),
]
