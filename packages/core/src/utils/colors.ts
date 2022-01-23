import type { RGBAColorValue } from '../types'

/* eslint-disable no-case-declarations */
const hexRE = /^#?([\da-f]+)$/i

export function hex2rgba(hex = ''): RGBAColorValue | undefined {
  const [, body] = hex.match(hexRE) || []

  if (!body)
    return

  switch (body.length) {
    case 3:
    case 4:
      const digits = Array.from(body, s => Number.parseInt(s, 16)).map(n => (n << 4) | n)
      if (body.length === 3)
        return digits as [number, number, number]
      digits[3] = Math.round(digits[3] / 255 * 100) / 100
      return digits as [number, number, number, number]
    case 6:
    case 8:
      const value = Number.parseInt(body, 16)
      if (body.length === 6)
        return [(value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF]
      return [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, Math.round((value & 0xFF) / 255 * 100) / 100]
  }
}

export function parseCssColor(color = '') {
  if (!color)
    return

  const hex = hex2rgba(color)
  if (hex != null)
    return hex.length === 3 ? ['rgb', ...hex] : ['rgba', ...hex]

  const builtIn = cssColor(color)
  if (builtIn != null)
    return builtIn

  const scf = cssSpaceColorFunction(color)
  if (scf != null)
    return scf

  return cssCommaColorFunction(color)
}

function cssColor(str) {
  if (str === 'transparent')
    return ['rgba', 0, 0, 0, 0]
}

function getComponent(separator: string, str: string) {
  let l = str.length
  let parenthesis = 0
  for (let i = 0; i < l; i++) {
    const chr = str[i]
    switch (chr) {
      case '(':
        if (parenthesis++ < 0)
          return
        break

      case ')':
        if (--parenthesis < 0)
          return
        break

      case separator:
        if (parenthesis === 0) {
          return [
            str.slice(0, i).trim(),
            str.slice(i + 1).trim(),
          ]
        }
    }
  }

  return [
    str.trim(),
    '',
  ]
}

function cssCommaColorFunction(color: string) {
  const parsed = parseCssCommaColorFunction(color)
  if (!parsed)
    return

  const [fn, ...components] = parsed
  if (['rgba', 'hsla'].includes(fn) && components.length !== 4)
    return

  return parsed
}

function parseCssCommaColorFunction(color: string) {
  const match = color.match(/^(rgb|rgba|hsl|hsla)\((.+)\)$/)
  if (!match)
    return
  const [, fn, componentString] = match

  let cs = componentString
  const components = []
  // With min 3 (rgb) and max 4 (rgba), try to get 5 components
  for (let c = 5; c > 0 && cs !== ''; --c) {
    const cc = getComponent(',', cs)
    if (!cc)
      return
    const [component, rest] = cc
    components.push(component)
    cs = rest
  }

  if ([3, 4].includes(components.length))
    return [fn, ...components]
}

function cssSpaceColorFunction(color: string) {
  const parsed = parseCssSpaceColorFunction(color)
  if (!parsed)
    return

  const [fn, ...components] = parsed
  if (['rgba', 'hsla'].includes(fn) && components.length !== 4)
    return

  return parsed
}

function parseCssSpaceColorFunction(color: string) {
  const match = color.match(/^(color|rgb|rgba|hsl|hsla|hwb|lab|lch)\((.+)\)$/)
  if (!match)
    return

  let [, fn, componentString] = match
  if (fn !== 'color') {
    componentString = `${fn} ${componentString}`
  }

  let cs = componentString
  const components = []
  // With min 4 (fn c1 c2 c3)/(fn c1 c2 c3/a) and max 6 (fn c1 c2 c3 / a), try to get 7 components
  for (let c = 7; c > 0 && cs !== ''; --c) {
    const cc = getComponent(' ', cs)
    if (!cc)
      return
    const [component, rest] = cc
    components.push(component)
    cs = rest
  }

  // component with alpha
  if (components.length === 6 && components[4] === '/')
    return [...components.slice(0, 4), components[5]]

  // maybe rgba(1 2 3/4)
  if (components.length === 4) {
    cs = components[3]
    const maybeWithAlpha = []
    for (let c = 2; c > 0 && cs !== ''; --c) {
      const cc = getComponent('/', cs)
      if (!cc)
        return
      const [component, rest] = cc
      maybeWithAlpha.push(component)
      cs = rest
    }
    return [...components.slice(0, 3), ...maybeWithAlpha]
  }

  if (components.length !== 5)
    return

  // rgba(1 2 3 /4)
  if (components[4].startsWith('/')) {
    components[4] = components[4].replace(/\//, '')
    return components
  }

  // rgba(1 2 3/ 4)
  if (components[3].endsWith('/')) {
    components[3] = components[3].replace(/\/$/, '')
    return components
  }
}
