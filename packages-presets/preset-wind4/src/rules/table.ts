import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { defineProperty, h, numberResolver, themeTracking } from '../utils'

export const tables: Rule<Theme>[] = [
  // displays
  ['inline-table', { display: 'inline-table' }],
  ['table', { display: 'table' }],
  ['table-caption', { display: 'table-caption' }],
  ['table-cell', { display: 'table-cell' }],
  ['table-column', { display: 'table-column' }],
  ['table-column-group', { display: 'table-column-group' }],
  ['table-footer-group', { display: 'table-footer-group' }],
  ['table-header-group', { display: 'table-header-group' }],
  ['table-row', { display: 'table-row' }],
  ['table-row-group', { display: 'table-row-group' }],

  // layouts
  ['border-collapse', { 'border-collapse': 'collapse' }],
  ['border-separate', { 'border-collapse': 'separate' }],

  [/^border-spacing-(.+)$/, function* ([, s], { theme }) {
    const v = resolveValue(s, theme)

    if (v != null) {
      yield {
        '--un-border-spacing-x': v,
        '--un-border-spacing-y': v,
        'border-spacing': 'var(--un-border-spacing-x) var(--un-border-spacing-y)',
      }
      for (const d of ['x', 'y'])
        yield defineProperty(`--un-border-spacing-${d}`, { syntax: '<length>', initialValue: '0' })
    }
  }, { autocomplete: ['border-spacing', 'border-spacing-$spacing'] }],

  [/^border-spacing-([xy])-(.+)$/, function* ([, d, s], { theme }) {
    const v = resolveValue(s, theme)
    if (v != null) {
      yield {
        [`--un-border-spacing-${d}`]: v,
        'border-spacing': 'var(--un-border-spacing-x) var(--un-border-spacing-y)',
      }
      for (const d of ['x', 'y'])
        yield defineProperty(`--un-border-spacing-${d}`, { syntax: '<length>', initialValue: '0' })
    }
  }, { autocomplete: ['border-spacing-(x|y)', 'border-spacing-(x|y)-$spacing'] }],

  ['caption-top', { 'caption-side': 'top' }],
  ['caption-bottom', { 'caption-side': 'bottom' }],
  ['table-auto', { 'table-layout': 'auto' }],
  ['table-fixed', { 'table-layout': 'fixed' }],
  ['table-empty-cells-visible', { 'empty-cells': 'show' }],
  ['table-empty-cells-hidden', { 'empty-cells': 'hide' }],
]

function resolveValue(s: string, theme: Theme) {
  let v = theme.spacing?.[s]

  if (!v) {
    const num = numberResolver(s)
    if (num != null) {
      themeTracking(`spacing`)
      v = `calc(var(--spacing) * ${num})`
    }
    else {
      v = h.bracket.cssvar.global.auto.fraction.rem(s)
    }
  }

  return v
}
