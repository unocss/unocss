import type { Rule } from '@unocss/core'
import { colorToString, h, parseCssColor } from '../utils'
import type { Theme } from '../../theme'

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
  [/^\[(.*)\]$/, ([_, body], { theme }) => {
    if (!body.includes(':'))
      return

    const [prop, ...rest] = body.split(':')
    const value = rest.join(':')
    if (!isURI(body) && prop.match(/^[a-z-]+$/) && isValidCSSBody(value)) {
      if (value.includes('theme')) {
        const val = parseThemeString(value, theme)
        if (val)
          return { [prop]: val }
      }

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
  catch (err) {
    return false
  }
}

function parseThemeString(value: string, theme: Theme) {
  const reg = /theme\((.*?)\)/g
  for (const match of Array.from(value.matchAll(reg))) {
    const [keyStr, alpha] = match[1].split('/') as [string, string?]
    const keys = keyStr.trim().split('.')
    let val = keys.reduce((p, c) => p?.[c], theme as any)

    if (!val)
      return

    if (keys[0] === 'colors' && alpha) {
      const color = parseCssColor(val)
      if (color)
        val = colorToString(color, alpha)
    }

    value = value.replace(match[0], val)
  }

  return value
}
