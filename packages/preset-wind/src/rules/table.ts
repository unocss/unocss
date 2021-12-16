import type { Rule } from '@unocss/core'
import { createKeywordRules } from '@unocss/preset-mini/utils'

export const tables: Rule[] = [
  ['inline-table', { display: 'inline-table' }],
  ['table', { display: 'table' }],
  ...createKeywordRules('table', 'display', [
    ['caption', 'table-caption'],
    ['cell', 'table-cell'],
    ['column', 'table-column'],
    ['column-group', 'table-column-group'],
    ['footer-group', 'table-footer-group'],
    ['header-group', 'table-header-group'],
    ['inline', 'inline-table'],
    ['row', 'table-row'],
    ['row-group', 'table-row-group'],
  ]),

  // layouts
  ...createKeywordRules('table', 'table-layout', [
    'auto',
    'fixed',
  ]),
  ...createKeywordRules('border', 'border-collapse', [
    'collapse',
    'separate',
  ]),
  ...createKeywordRules('caption', 'caption-side', [
    'bottom',
    'top',
  ]),
  ['table-empty-cells-visible', { 'empty-cells': 'show' }],
  ['table-empty-cells-hidden', { 'empty-cells': 'hide' }],
]
