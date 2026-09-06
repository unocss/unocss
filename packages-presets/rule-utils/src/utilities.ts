import { isString } from '@unocss/core'

export function getBracket(str: string, open: string, close: string) {
  if (str === '')
    return

  const l = str.length
  let parenthesis = 0
  let opened = false
  let openAt = 0
  for (let i = 0; i < l; i++) {
    switch (str[i]) {
      case open:
        if (!opened) {
          opened = true
          openAt = i
        }
        parenthesis++
        break

      case close:
        --parenthesis
        if (parenthesis < 0)
          return
        if (parenthesis === 0) {
          return [
            str.slice(openAt, i + 1),
            str.slice(i + 1),
            str.slice(0, openAt),
          ]
        }
        break
    }
  }
}

export function getStringComponent(str: string, open: string, close: string, separators: string | string[]) {
  if (str === '')
    return

  if (isString(separators))
    separators = [separators]

  if (separators.length === 0)
    return

  const l = str.length
  let parenthesis = 0
  for (let i = 0; i < l; i++) {
    switch (str[i]) {
      case open:
        parenthesis++
        break

      case close:
        if (--parenthesis < 0)
          return
        break

      default:
        for (const separator of separators) {
          const separatorLength = separator.length
          if (separatorLength && separator === str.slice(i, i + separatorLength) && parenthesis === 0) {
            if (i === 0 || i === l - separatorLength)
              return
            return [
              str.slice(0, i),
              str.slice(i + separatorLength),
            ]
          }
        }
    }
  }

  return [
    str,
    '',
  ]
}

export function getStringComponents(str: string, separators: string | string[], limit?: number, open: string = '(', close: string = ')') {
  limit = limit ?? 10
  const components = []
  let i = 0
  while (str !== '') {
    if (++i > limit)
      return
    const componentPair = getStringComponent(str, open, close, separators)
    if (!componentPair)
      return
    const [component, rest] = componentPair
    components.push(component)
    str = rest
  }
  if (components.length > 0)
    return components
}

// Wind4 theme keys breakpoints as `breakpoint`, Wind3 as `breakpoints`; keying on theme presence keeps custom or renamed presets working.
const reLetters = /[a-z]+/gi

export function resolveBreakpoints(theme: Record<string, any>) {
  const breakpoints: Record<string, string> | undefined = theme.breakpoint ?? theme.breakpoints

  if (!breakpoints)
    return undefined

  return Object.entries(breakpoints)
    .sort((a, b) => Number.parseInt(a[1].replace(reLetters, '')) - Number.parseInt(b[1].replace(reLetters, '')))
    .map(([point, size]) => ({ point, size }))
}
