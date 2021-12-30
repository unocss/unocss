import type { Rule } from '@unocss/core'
import { directionMap } from '../utils'

const variablesAbbrMap: Record<string, string> = {
  'visible': 'visibility',
  'select': 'user-select',
  'vertical': 'vertical-align',
  'backface': 'backface-visibility',
  'whitespace': 'white-space',
  'break': 'word-break',
  'b': 'border-color',
  'border': 'border-color',
  'color': 'color',
  'case': 'text-transform',
  'origin': 'transform-origin',
  'bg': 'background-color',
  'bg-opacity': 'background-opacity',
  'tab': 'tab-size',
  'underline': 'text-decoration-thickness',
  'underline-offset': 'text-underline-offset',
  'text': 'color',
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
}

export const cssVariables: Rule[] = [
  [/^(.+)-\$(.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name]
    if (prop)
      return { [prop]: `var(--${varname})` }
  }],
  [/^(?:border|b)-([^-]+)-\$(.+)$/, ([, a, v]: string[]) => {
    if (a in directionMap)
      return directionMap[a].map((i): [string, string] => [`border${i}-color`, `var(--${v})`])
  }],
]
