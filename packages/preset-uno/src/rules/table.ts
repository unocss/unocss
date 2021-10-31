import { Rule } from '@unocss/core'

export const tables: Rule[] = [
  ['border-collapse', { 'border-collapse': 'collapse' }],
  ['border-separate', { 'border-collapse': 'separate' }],
  ['caption-top', { 'caption-side': 'top' }],
  ['caption-bottom', { 'caption-side': 'bottom' }],
  ['inline-table', { display: 'inline-table' }],
  ['table', { display: 'table' }],
  ['table-auto', { 'table-layout': 'auto' }],
  ['table-empty-cells-visible', { 'empty-cells': 'show' }],
  ['table-empty-cells-hidden', { 'empty-cells': 'hide' }],
  ['table-fixed', { 'table-layout': 'fixed' }],
  ['table-caption', { display: 'table-caption' }],
  ['table-cell', { display: 'table-cell' }],
  ['table-column', { display: 'table-column' }],
  ['table-column-group', { display: 'table-column-group' }],
  ['table-footer-group', { display: 'table-footer-group' }],
  ['table-header-group', { display: 'table-header-group' }],
  ['table-row', { display: 'table-row' }],
  ['table-row-group', { display: 'table-row-group' }],
]
