import type { Rule } from '@unocss/core'
import { handler as h } from '../utils'

const variablesAbbrMap: Record<string, string> = {
  backface: 'backface-visibility',
  break: 'word-break',
  case: 'text-transform',
  content: 'align-content',
  fw: 'font-weight',
  items: 'align-items',
  justify: 'justify-content',
  select: 'user-select',
  self: 'align-self',
  vertical: 'vertical-align',
  visible: 'visibility',
  whitespace: 'white-space',
  ws: 'white-space',
}

export const cssVariables: Rule[] = [
  [/^(.+?)-(\$.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name]
    if (prop)
      return { [prop]: h.cssvar(varname) }
  }],
]

export const cssProperty: Rule[] = [
  [/^\[([^'"]?.+):(.+)\]$/, ([, prop, value]) => {
    // preset-wind.test.ts / non-targets
    // allow `~` and `=` only in css variables as they can be escaped
    if (/~|=/.test(prop) && !prop.startsWith('--'))
      return

    return { [prop]: h.bracket(`[${value}]`) }
  }],
]
