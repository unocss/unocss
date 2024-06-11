import { escapeRegExp } from '@unocss/core'
import { getStringComponents } from './utilities'

export interface CSSColorValue {
  type: string
  components: (string | number)[]
  alpha: string | number | undefined
}

export type RGBAColorValue = [number, number, number, number] | [number, number, number]

export interface ParsedColorValue {
  /**
   * Parsed color value.
   */
  color?: string
  /**
   * Parsed opacity value.
   */
  opacity: string
  /**
   * Color name.
   */
  name: string
  /**
   * Color scale, preferably 000 - 999.
   */
  no: string
  /**
   * {@link CSSColorValue}
   */
  cssColor: CSSColorValue | undefined
  /**
   * Parsed alpha value from opacity
   */
  alpha: string | number | undefined
}

/* eslint-disable no-case-declarations */
const cssColorFunctions = ['hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'rgb', 'rgba']
const alphaPlaceholders = ['%alpha', '<alpha-value>']
const alphaPlaceholdersRE = new RegExp(alphaPlaceholders.map(v => escapeRegExp(v)).join('|'))

export function hex2rgba(hex = ''): RGBAColorValue | undefined {
  const color = parseHexColor(hex)
  if (color != null) {
    const { components, alpha } = color
    if (alpha == null)
      return components as [number, number, number]
    return [...components, alpha] as [number, number, number, number]
  }
}

export function parseCssColor(str = ''): CSSColorValue | undefined {
  const color = parseColor(str)
  if (color == null || color === false)
    return

  const { type: casedType, components, alpha } = color
  const type = casedType.toLowerCase()

  if (components.length === 0)
    return

  if (cssColorFunctions.includes(type) && ![1, 3].includes(components.length))
    return

  return {
    type,
    components: components.map(c => typeof c === 'string' ? c.trim() : c),
    alpha: typeof alpha === 'string' ? alpha.trim() : alpha,
  }
}

export function colorOpacityToString(color: CSSColorValue) {
  const alpha = color.alpha ?? 1
  return (typeof alpha === 'string' && alphaPlaceholders.includes(alpha))
    ? 1
    : alpha
}

export function colorToString(color: CSSColorValue | string, alphaOverride?: string | number) {
  if (typeof color === 'string')
    return color.replace(alphaPlaceholdersRE, `${alphaOverride ?? 1}`)

  const { components } = color
  let { alpha, type } = color
  alpha = alphaOverride ?? alpha
  type = type.toLowerCase()

  if (['hsla', 'rgba'].includes(type))
    return `${type}(${components.join(', ')}${alpha == null ? '' : `, ${alpha}`})`

  alpha = alpha == null ? '' : ` / ${alpha}`
  if (cssColorFunctions.includes(type))
    return `${type}(${components.join(' ')}${alpha})`
  return `color(${type} ${components.join(' ')}${alpha})`
}

function parseColor(str: string) {
  if (!str)
    return

  let color: CSSColorValue | false | undefined = parseHexColor(str)
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

function parseHexColor(str: string): CSSColorValue | undefined {
  const [, body] = str.match(/^#([\da-f]+)$/i) || []
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

function cssColorKeyword(str: string): CSSColorValue | undefined {
  const color = {
    rebeccapurple: [102, 51, 153, 1],
  }[str]

  if (color != null) {
    return {
      type: 'rgb',
      components: color.slice(0, 3),
      alpha: color[3],
    }
  }
}

function parseCssCommaColorFunction(color: string): CSSColorValue | false | undefined {
  const match = color.match(/^(rgb|rgba|hsl|hsla)\((.+)\)$/i)
  if (!match)
    return

  const [, type, componentString] = match
  // With min 3 (rgb) and max 4 (rgba), try to get 5 components
  const components = getStringComponents(componentString, ',', 5)
  if (components) {
    if ([3, 4].includes(components.length)) {
      return {
        type,
        components: components.slice(0, 3),
        alpha: components[3],
      }
    }
    else if (components.length !== 1) {
      return false
    }
  }
}

const cssColorFunctionsRe = new RegExp(`^(${cssColorFunctions.join('|')})\\((.+)\\)$`, 'i')
function parseCssSpaceColorFunction(color: string): CSSColorValue | undefined {
  const match = color.match(cssColorFunctionsRe)
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
  const components = getStringComponents(componentString, ' ')
  if (!components)
    return

  let totalComponents = components.length

  // (fn 1 2 3 / 4)
  if (components[totalComponents - 2] === '/') {
    return {
      components: components.slice(0, totalComponents - 2),
      alpha: components[totalComponents - 1],
    }
  }

  // (fn 1 2 3/ 4) or (fn 1 2 3 /4)
  if (components[totalComponents - 2] != null && (components[totalComponents - 2].endsWith('/') || components[totalComponents - 1].startsWith('/'))) {
    const removed = components.splice(totalComponents - 2)
    components.push(removed.join(' '))
    --totalComponents
  }

  // maybe (fn 1 2 3/4)
  const withAlpha = getStringComponents(components[totalComponents - 1], '/', 2)
  if (!withAlpha)
    return

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
