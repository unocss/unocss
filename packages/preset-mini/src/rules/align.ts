import type { Rule } from '@unocss/core'
import { globalKeywords } from '../utils/mappings'

const verticalAlignAlias: Record<string, string> = {
  'mid': 'middle',
  'base': 'baseline',
  'btm': 'bottom',
  'baseline': 'baseline',
  'top': 'top',
  'middle': 'middle',
  'bottom': 'bottom',
  'text-top': 'text-top',
  'text-bottom': 'text-bottom',
  'sub': 'sub',
  'super': 'super',
}

export const verticalAligns: Rule[] = [
  [/^(?:vertical|align|v)-(.+)$/, ([, v]) => ({ 'vertical-align': verticalAlignAlias[v] }), { autocomplete: `(vertical|align|v)-(${Object.keys(verticalAlignAlias).join('|')})` }],
]

export const textAligns: Rule[] = ['center', 'left', 'right', 'justify', 'start', 'end', ...globalKeywords].map(v => [`text-${v}`, { 'text-align': v }])
