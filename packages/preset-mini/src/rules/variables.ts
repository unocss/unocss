import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const variablesAbbrMap: Record<string, string> = {
  'backface': 'backface-visibility',
  'break': 'word-break',
  'case': 'text-transform',
  'content': 'align-content',
  'flex': 'flex',
  'fw': 'font-weight',
  'items': 'align-items',
  'justify': 'justify-content',
  'leading': 'line-height',
  'lh': 'line-height',
  'select': 'user-select',
  'self': 'align-self',
  'tracking': 'letter-spacing',
  'vertical': 'vertical-align',
  'visible': 'visibility',
  'whitespace': 'white-space',
  'word-spacing': 'word-spacing',
  'ws': 'white-space',
}

export const cssVariables: Rule[] = [
  [/^([^$]+)(?<=-)\$(.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name.slice(0, -1)]
    if (prop)
      return { [prop]: `var(--${varname})` }
  }],
]

export const cssProperty: Rule[] = [
  [/^\[([^:]+):(.+)\]$/, ([, prop, value]) => ({ [prop]: h.bracket(`[${value}]`) })],
]
