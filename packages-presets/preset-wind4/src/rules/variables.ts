import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { h } from '../utils'

const variablesAbbrMap: Record<string, string> = {
  'backface': 'backface-visibility',
  'break': 'word-break',
  'case': 'text-transform',
  'content': 'align-content',
  'fw': 'font-weight',
  'items': 'align-items',
  'justify': 'justify-content',
  'select': 'user-select',
  'self': 'align-self',
  'vertical': 'vertical-align',
  'visible': 'visibility',
  'whitespace': 'white-space',
  'ws': 'white-space',
  'bg-blend': 'background-blend-mode',
  'bg-clip': '-webkit-background-clip',
  'bg-image': 'background-image',
  'bg-origin': 'background-origin',
  'bg-position': 'background-position',
  'bg-repeat': 'background-repeat',
  'bg-size': 'background-size',
  'mix-blend': 'mix-blend-mode',
  'object': 'object-fit',
  'object-position': 'object-position',
  'write': 'writing-mode',
  'write-orient': 'text-orientation',
}

export const cssVariables: Rule<Theme>[] = [
  [/^(.+?)-(\$.+)$/, ([, name, varname]) => {
    const prop = variablesAbbrMap[name]
    if (prop)
      return { [prop]: h.cssvar(varname) }
  }],
]

export const cssProperty: Rule<Theme>[] = [
  [/^\[(.*)\]$/, ([_, body]) => {
    if (!body.includes(':'))
      return

    const [prop, ...rest] = body.split(':')
    const value = rest.join(':')

    if (!isURI(body) && /^[a-z-]+$/.test(prop) && isValidCSSBody(value)) {
      const parsed = h.bracket(`[${value}]`)

      if (parsed)
        return { [prop]: parsed }
    }
  }],
]

function isValidCSSBody(body: string) {
  let i = 0
  function findUntil(c: string) {
    while (i < body.length) {
      i += 1
      const char = body[i]
      if (char === c)
        return true
    }
    return false
  }

  for (i = 0; i < body.length; i++) {
    const c = body[i]
    if ('"`\''.includes(c)) {
      if (!findUntil(c))
        return false
    }
    else if (c === '(') {
      if (!findUntil(')'))
        return false
    }
    else if ('[]{}:'.includes(c)) {
      return false
    }
  }

  return true
}

function isURI(declaration: string) {
  if (!declaration.includes('://'))
    return false

  try {
    return new URL(declaration).host !== ''
  }
  catch {
    return false
  }
}
