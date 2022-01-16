import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const variablesAbbrMap: Record<string, string> = {
  'visible': 'visibility',
  'select': 'user-select',
  'vertical': 'vertical-align',
  'backface': 'backface-visibility',
  'whitespace': 'white-space',
  'break': 'word-break',
  'case': 'text-transform',
  'origin': 'transform-origin',
  'bg-opacity': 'background-opacity',
  'tab': 'tab-size',
  'underline': 'text-decoration-thickness',
  'underline-offset': 'text-underline-offset',
  'grid-cols': 'grid-template-columns',
  'grid-rows': 'grid-template-rows',
  'auto-flow': 'grid-auto-flow',
  'row-start': 'grid-row-start',
  'row-end': 'grid-row-end',
  'justify': 'justify-content',
  'content': 'align-content',
  'items': 'align-items',
  'self': 'align-self',
  'object': 'object-fit',
  'flex': 'flex',
  'fw': 'font-weight',
  'leading': 'line-height',
  'lh': 'line-height',
  'tracking': 'letter-spacing',
  'word-spacing': 'word-spacing',
  'ws': 'white-space',
}

export const cssVariables: Rule[] = [
  [/^(.+)-\$(.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name]
    if (prop)
      return { [prop]: `var(--${varname})` }
  }],
]

export const cssProperty: Rule[] = [
  [/^\[(.+):(.+)\]$/, ([, prop, value]) => ({ [prop]: h.bracket(`[${value}]`) })],
]
