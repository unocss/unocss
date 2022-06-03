import type { Rule } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { handler as h } from '@unocss/preset-mini/utils'

export const borderSpacingBase = {
  '--un-border-spacing-x': 0,
  '--un-border-spacing-y': 0,
}
const borderSpacingProperty = 'var(--un-border-spacing-x) var(--un-border-spacing-y)'

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

  [/^border-spacing-(.+)$/, ([, s], { theme }) => {
    const v = theme.spacing?.[s] ?? h.bracket.cssvar.global.auto.fraction.rem(s)
    if (v != null) {
      return {
        '--un-border-spacing-x': v,
        '--un-border-spacing-y': v,
        'border-spacing': borderSpacingProperty,
      }
    }
  }, { autocomplete: ['border-spacing', 'border-spacing-$spacing'] }],

  [/^border-spacing-([xy])-(.+)$/, ([, d, s], { theme }) => {
    const v = theme.spacing?.[s] ?? h.bracket.cssvar.global.auto.fraction.rem(s)
    if (v != null) {
      return {
        [`--un-border-spacing-${d}`]: v,
        'border-spacing': borderSpacingProperty,
      }
    }
  }, { autocomplete: ['border-spacing-(x|y)', 'border-spacing-(x|y)-$spacing'] }],

  ['caption-top', { 'caption-side': 'top' }],
  ['caption-bottom', { 'caption-side': 'bottom' }],
  ['table-auto', { 'table-layout': 'auto' }],
  ['table-fixed', { 'table-layout': 'fixed' }],
  ['table-empty-cells-visible', { 'empty-cells': 'show' }],
  ['table-empty-cells-hidden', { 'empty-cells': 'hide' }],
]
