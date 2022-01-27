import type { CSSColorValue, RGBAColorValue } from '@unocss/core'

/* eslint-disable no-case-declarations */

export function hex2rgba(hex = ''): RGBAColorValue | undefined {
  const color = parseHexColor(hex)
  if (color != null) {
    const { components, alpha } = color
    if (alpha === undefined)
      return components as [number, number, number]
    return [...components, alpha] as [number, number, number, number]
  }
}

function parseHexColor(str: string): CSSColorValue | undefined {
  const [, body] = str.match(/^#?([\da-f]+)$/i) || []
  if (!body)
    return

  switch (body.length) {
    case 3:
    case 4:
      const digits = Array.from(body, s => Number.parseInt(s, 16)).map(n => (n << 4) | n)
      return {
        type: 'rgb',
        components: digits.slice(0, 3),
        alpha: body.length === 3
          ? undefined
          : Math.round(digits[3] / 255 * 100) / 100,
      }

    case 6:
    case 8:
      const value = Number.parseInt(body, 16)
      return {
        type: 'rgb',
        components: body.length === 6
          ? [(value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF]
          : [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF],
        alpha: body.length === 6
          ? undefined
          : Math.round((value & 0xFF) / 255 * 100) / 100,
      }
  }
}

export function parseCssColor(str = ''): CSSColorValue | undefined {
  const color = parseColor(str)
  if (color == null)
    return

  const { type: casedType, components, alpha } = color
  const type = casedType.toLowerCase()

  if (['rgba', 'hsla'].includes(type) && alpha === undefined)
    return

  if (['rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch'].includes(type) && components.length !== 3)
    return

  return { type, components, alpha }
}

function parseColor(str: string) {
  if (!str)
    return

  let color = parseHexColor(str)
  if (color != null)
    return color

  color = cssColorKeyword(str)
  if (color != null)
    return color

  color = parseCssCommaColorFunction(str)
  if (color != null)
    return color

  color = parseCssSpaceColorFunction(str)
  if (color != null)
    return color

  color = parseCssColorFunction(str)
  if (color != null)
    return color
}

function cssColorKeyword(str: string): CSSColorValue | undefined {
  const color = {
    rebeccapurple: [102, 51, 153, 1],
    transparent: [0, 0, 0, 0],
  }[str]

  if (color != null) {
    return {
      type: 'rgb',
      components: color.slice(0, 3),
      alpha: color[3],
    }
  }
}

function getComponent(separator: string, str: string) {
  const component = str.trim()
  if (component === '')
    return

  const l = str.length
  let parenthesis = 0
  for (let i = 0; i < l; i++) {
    switch (str[i]) {
      case '(':
        parenthesis++
        break

      case ')':
        if (--parenthesis < 0)
          return
        break

      case separator:
        if (parenthesis === 0) {
          const component = str.slice(0, i).trim()
          if (component === '')
            return

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
  const match = color.match(/^(rgb|rgba|hsl|hsla)\((.+)\)$/i)
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
  const match = color.match(/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\((.+)\)$/i)
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

  let totalComponents = components.length

  // (fn 1 2 3 / 4)
  if (components[totalComponents - 2] === '/') {
    return {
      components: components.slice(0, totalComponents - 2),
      alpha: components[totalComponents - 1],
    }
  }

  // (fn 1 2 3/ 4) or (fn 1 2 3 /4)
  if (components[totalComponents - 2].endsWith('/') || components[totalComponents - 1].startsWith('/')) {
    const removed = components.splice(totalComponents - 2)
    components.push(removed.join(' '))
    --totalComponents
  }

  // maybe (fn 1 2 3/4)
  cs = components[totalComponents - 1]
  const withAlpha = []
  while (cs !== '') {
    const cc = getComponent('/', cs)
    if (!cc)
      return
    const [component, rest] = cc
    withAlpha.push(component)
    cs = rest
  }

  // without alpha
  if (withAlpha.length === 1 || withAlpha[withAlpha.length - 1] === '')
    return { components }

  const alpha = withAlpha.pop()
  components[totalComponents - 1] = withAlpha.join('/')
  return {
    components,
    alpha,
  }
}
