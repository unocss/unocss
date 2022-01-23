import type { CSSColorValue, RGBAColorValue } from '../types'

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

  const colorValue = parseColorFunction(color)
  if (colorValue == null)
    return

  const { type, components, alpha } = colorValue

  if (['rgba', 'hsla'].includes(type) && alpha === undefined)
    return

  if (['rgb', 'hsl', 'hwb', 'lab', 'lch'].includes(type) && components.length !== 3)
    return

  return [type, ...components, alpha].filter(x => x !== undefined)
}

function cssColor(str: string) {
  if (str === 'transparent')
    return ['rgba', 0, 0, 0, 0]
}

function parseColorFunction(str: string) {
  let color = parseCssCommaColorFunction(str)
  if (color != null)
    return color

  color = parseCssSpaceColorFunction(str)
  if (color != null)
    return color

  color = parseCssColorFunction(str)
  if (color != null)
    return color
}

function getComponent(separator: string, str: string) {
  const l = str.length
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

function parseCssCommaColorFunction(color: string): CSSColorValue | undefined {
  const match = color.match(/^(rgb|rgba|hsl|hsla)\((.+)\)$/)
  if (!match)
    return

  const [, type, componentString] = match
  const components = []
  let cs = componentString
  // With min 3 (rgb) and max 4 (rgba), try to get 5 components
  for (let c = 5; c > 0 && cs !== ''; --c) {
    const componentValue = getComponent(',', cs)
    if (!componentValue)
      return
    const [component, rest] = componentValue
    components.push(component)
    cs = rest
  }

  if ([3, 4].includes(components.length)) {
    return {
      type,
      components: components.slice(0, 3),
      alpha: components[3],
    }
  }
}

function parseCssSpaceColorFunction(color: string): CSSColorValue | undefined {
  const match = color.match(/^(rgb|rgba|hsl|hsla|hwb|lab|lch)\((.+)\)$/)
  if (!match)
    return

  const [, fn, componentString] = match
  const parsed = parseCssSpaceColorValues(`${fn} ${componentString}`)
  if (parsed) {
    const { alpha, components: [type, ...components] } = parsed
    return {
      type,
      components,
      alpha,
    }
  }
}

function parseCssColorFunction(color: string): CSSColorValue | undefined {
  const match = color.match(/^color\((.+)\)$/)
  if (!match)
    return

  const parsed = parseCssSpaceColorValues(match[1])
  if (parsed) {
    const { alpha, components: [type, ...components] } = parsed
    return {
      type,
      components,
      alpha,
    }
  }
}

function parseCssSpaceColorValues(componentString: string) {
  let cs = componentString
  const components = []
  while (cs !== '') {
    const cc = getComponent(' ', cs)
    if (!cc)
      return
    const [component, rest] = cc
    components.push(component)
    cs = rest
  }

  const totalComponents = components.length

  // (fn 1 2 3 / 4)
  if (components[totalComponents - 2] === '/') {
    return {
      components: components.slice(0, totalComponents - 2),
      alpha: components[totalComponents - 1],
    }
  }

  // (fn 1 2 3 /4)
  if (components[totalComponents - 1].startsWith('/')) {
    return {
      components: components.slice(0, totalComponents - 1),
      alpha: components[totalComponents - 1].replace(/\//, ''),
    }
  }

  // (fn 1 2 3/ 4)
  if (components[totalComponents - 2].endsWith('/')) {
    components[totalComponents - 2] = components[totalComponents - 2].replace(/\/$/, '')
    return {
      components: components.slice(0, totalComponents - 1),
      alpha: components[totalComponents - 1],
    }
  }

  // maybe (fn 1 2 3/4)
  cs = components[totalComponents - 1]
  const maybeWithAlpha = []
  for (let c = 2; c > 0 && cs !== ''; --c) {
    const cc = getComponent('/', cs)
    if (!cc)
      return
    const [component, rest] = cc
    maybeWithAlpha.push(component)
    cs = rest
  }

  if (cs !== '')
    return

  components[totalComponents - 1] = maybeWithAlpha[0]
  return {
    components,
    alpha: maybeWithAlpha[1],
  }
}
