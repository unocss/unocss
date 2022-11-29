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
  [/^\[(--(\w|\\\W)+|[\w-]+):(.+)\]$/, ([match, prop,, value]) => {
    if (!isURI(match.slice(1, -1)))
      return { [prop]: h.bracket(`[${value}]`) }
  }],
]

function isURI(declaration: string) {
  if (!declaration.includes('://'))
    return false

  try {
    return new URL(declaration).host !== ''
  }
  catch (err) {
    return false
  }
}
