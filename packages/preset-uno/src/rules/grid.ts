import { Rule } from '@unocss/core'

export const grids: Rule[] = [
  ['grid', { display: 'grid' }],
  ['inline-grid', { display: 'inline-grid' }],
  [/^grid-cols-(\d+)$/, ([, d]) => ({ 'grid-template-columns': `repeat(${d}, minmax(0, 1fr))` })],
  [/^grid-rows-(\d+)$/, ([, d]) => ({ 'grid-template-rows': `repeat(${d}, minmax(0, 1fr))` })],
  [/^grid-cols-\[(.+)\]$/, ([, v]) => ({ 'grid-template-columns': v.replace(/,/g, ' ') })],
  [/^grid-rows-\[(.+)\]$/, ([, v]) => ({ 'grid-template-rows': v.replace(/,/g, ' ') })],
]
