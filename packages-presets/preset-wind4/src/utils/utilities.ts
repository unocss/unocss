import type { CSSEntries, CSSObject, DynamicMatcher, RuleContext, StaticRule, VariantContext } from '@unocss/core'
import type { Theme } from '../theme'
import { toArray } from '@unocss/core'
import { colorToString, getStringComponent, getStringComponents, parseCssColor } from '@unocss/rule-utils'
import { h } from './handlers'
import { bracketTypeRe, numberWithUnitRE, splitComma } from './handlers/regex'
import { cssMathFnRE, cssVarFnRE, directionMap, globalKeywords, xyzArray, xyzMap } from './mappings'

export const CONTROL_MINI_NO_NEGATIVE = '$$mini-no-negative'
export const SpecialColorKey = {
  transparent: 'transparent',
  current: 'currentColor',
}

export function numberResolver(size: string, defaultValue?: string | number): number | undefined {
  const v = h.number(size) ?? defaultValue

  if (v != null) {
    let num = Number(v)
    if (String(v).endsWith('%')) {
      num = Number(String(v).slice(0, -1)) / 100
    }

    return num
  }
}

/**
 * Provide {@link DynamicMatcher} function returning spacing definition. See spacing rules.
 *
 * @param propertyPrefix - Property for the css value to be created. Postfix will be appended according to direction matched.
 * @see {@link directionMap}
 */
export function directionSize(propertyPrefix: string): DynamicMatcher<Theme> {
  const spaceMap = {
    'xs': 0.75 / 0.25,
    'sm': 0.875 / 0.25,
    'lg': 1.125 / 0.25,
    'xl': 1.25 / 0.25,
    '2xl': 1.5 / 0.25,
    '3xl': 1.875 / 0.25,
    '4xl': 2.25 / 0.25,
    '5xl': 3 / 0.25,
    '6xl': 3.75 / 0.25,
    '7xl': 4.5 / 0.25,
    '8xl': 6 / 0.25,
    '9xl': 8 / 0.25,
  }

  return (([_, direction, size]: string[]): CSSEntries | undefined => {
    let v: string | number | undefined

    v = numberResolver(size, spaceMap[size as keyof typeof spaceMap])

    if (v != null) {
      return directionMap[direction].map(i => [`${propertyPrefix}${i}`, `calc(var(--spacing) * ${v})`])
    }

    v = h.bracket.cssvar.global.auto.fraction.rem(size)

    if (v != null) {
      return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
    }

    if (size?.startsWith('-')) {
      const _v = spaceMap[size.slice(1) as keyof typeof spaceMap]
      if (_v != null) {
        v = `calc(var(--spacing) * -${_v})`
        return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
      }
    }
  }) as DynamicMatcher<Theme>
}

/**
 * Split utility shorthand delimited by / or :
 */
export function splitShorthand(body: string, type: string) {
  const [front, rest] = getStringComponent(body, '[', ']', ['/', ':']) ?? []

  if (front != null) {
    const match = (front.match(bracketTypeRe) ?? [])[1]

    if (match == null || match === type)
      return [front, rest]
  }
}

export function colorableShadows(shadows: string | string[], colorVar: string) {
  const colored = []
  shadows = toArray(shadows)
  for (let i = 0; i < shadows.length; i++) {
    // shadow values are between 3 to 6 terms including color
    const components = getStringComponents(shadows[i], ' ', 6)
    if (!components || components.length < 3)
      return shadows

    let isInset = false
    const pos = components.indexOf('inset')
    if (pos !== -1) {
      components.splice(pos, 1)
      isInset = true
    }

    let colorVarValue = ''
    const lastComp = components.at(-1)
    if (parseCssColor(components.at(0))) {
      const color = parseCssColor(components.shift())
      if (color)
        colorVarValue = `, ${colorToString(color)}`
    }
    else if (parseCssColor(lastComp)) {
      const color = parseCssColor(components.pop())
      if (color)
        colorVarValue = `, ${colorToString(color)}`
    }
    else if (lastComp && cssVarFnRE.test(lastComp)) {
      const color = components.pop()!
      colorVarValue = `, ${color}`
    }

    colored.push(`${isInset ? 'inset ' : ''}${components.join(' ')} var(${colorVar}${colorVarValue})`)
  }

  return colored
}

export function colorResolver(property: string, varName: string) {
  return ([, body]: string[], { theme, generator }: RuleContext<Theme>): CSSObject | undefined => {
    const data = parseColor(body, theme)
    if (!data)
      return

    const { color, key, opacity } = data
    const rawColorComment = generator.config.envMode === 'dev' && color ? ` /* ${color} */` : ''
    const css: CSSObject = {}

    if (color) {
      if (Object.values(SpecialColorKey).includes(color)) {
        css[property] = color
      }
      else {
        css[`--un-${varName}-opacity`] = `${opacity || 100}%`
        const value = key ? `var(--color-${key})` : color
        css[property] = `color-mix(in oklch, ${value} var(--un-${varName}-opacity), transparent)${rawColorComment}`
      }
    }

    return css
  }
}

/**
 * Parse color string into {@link ParsedColorValue} (if possible). Color value will first be matched to theme object before parsing.
 * See also color.tests.ts for more examples.
 *
 * @example Parseable strings:
 * 'red' // From theme, if 'red' is available
 * 'red-100' // From theme, plus scale
 * 'red-100/20' // From theme, plus scale/opacity
 * '[rgb(100 2 3)]/[var(--op)]' // Bracket with rgb color and bracket with opacity
 *
 * @param body - Color string to be parsed.
 * @param theme - {@link Theme} object.
 * @return object if string is parseable.
 */
export function parseColor(body: string, theme: Theme) {
  const split = splitShorthand(body, 'color')
  if (!split)
    return

  const [main, opacity] = split
  const colors = main
    .replace(/([a-z])(\d)/g, '$1-$2')
    .split(/-/g)
  const [name] = colors

  if (!name)
    return

  let { no, key, color } = parseThemeColor(theme, colors) ?? parseThemeColor(theme, [main]) ?? {}

  if (!color) {
    const bracket = h.bracketOfColor(main)
    const bracketOrMain = bracket || main

    if (h.numberWithUnit(bracketOrMain))
      return

    if (/^#[\da-f]+$/i.test(bracketOrMain))
      color = bracketOrMain
    else if (/^hex-[\da-fA-F]+$/.test(bracketOrMain))
      color = `#${bracketOrMain.slice(4)}`
    else if (main.startsWith('$'))
      color = h.cssvar(main)

    color = color || bracket
  }

  return {
    opacity,
    name,
    no,
    color: color ?? SpecialColorKey[name as keyof typeof SpecialColorKey],
    alpha: h.bracket.cssvar.percent(opacity ?? ''),
    /**
     * Key means the color is from theme object.
     */
    key,
  }
}

export function parseThemeColor(theme: Theme, keys: string[]) {
  let color: string | undefined
  let no
  let key

  let _keys = keys
  const [scale] = keys.slice(-1)

  if (/^\d+$/.test(scale)) {
    no = scale
    _keys = keys.slice(0, -1)
  }

  const colorData = getThemeColor(theme, _keys)

  if (typeof colorData === 'object') {
    color = colorData[no ?? '400'] as string
    key = [..._keys, no ?? '400'].join('-')
  }
  else if (typeof colorData === 'string' && !no) {
    color = colorData
    key = _keys.join('-')
  }

  if (!color)
    return

  return {
    color,
    no,
    key,
  }
}

export function getThemeColor(theme: Theme, keys: string[]) {
  let obj = theme.colors as Theme['colors'] | string
  let index = -1

  for (const k of keys) {
    index += 1
    if (obj && typeof obj !== 'string') {
      const camel = keys.slice(index).join('-').replace(/(-[a-z])/g, n => n.slice(1).toUpperCase())
      if (obj[camel])
        return obj[camel]

      if (obj[k]) {
        obj = obj[k]
        continue
      }
    }
    return undefined
  }

  return obj
}

export function colorVariable(str: string, varName: string) {
  // TODO: Optimize regex
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const colorRegex = /(#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgb(a)?\(\s*\d+(?:\s+\d*)?\s*\d*(\s*\/\s*[\d.]+)?\s*\)|hsl(a)?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(\s*,\s*[\d.]+)?\s*\))/g
  return str.replace(colorRegex, match => `var(--${varName}, ${match})`)
}

export function hasParseableColor(color: string | undefined, theme: Theme) {
  return color != null && !!parseColor(color, theme)?.color
}

const reLetters = /[a-z]+/gi
const resolvedBreakpoints = new WeakMap<any, { point: string, size: string }[]>()

export function resolveBreakpoints({ theme, generator }: Readonly<VariantContext<Theme>>, key: 'breakpoint' | 'verticalBreakpoint' = 'breakpoint') {
  const breakpoints: Record<string, string> | undefined = (generator?.userConfig?.theme as any)?.[key] || theme[key]

  if (!breakpoints)
    return undefined

  if (resolvedBreakpoints.has(theme))
    return resolvedBreakpoints.get(theme)

  const resolved = Object.entries(breakpoints)
    .sort((a, b) => Number.parseInt(a[1].replace(reLetters, '')) - Number.parseInt(b[1].replace(reLetters, '')))
    .map(([point, size]) => ({ point, size }))

  resolvedBreakpoints.set(theme, resolved)
  return resolved
}

export function resolveVerticalBreakpoints(context: Readonly<VariantContext<Theme>>) {
  return resolveBreakpoints(context, 'verticalBreakpoint')
}

export function makeGlobalStaticRules(prefix: string, property?: string): StaticRule[] {
  return globalKeywords.map(keyword => [`${prefix}-${keyword}`, { [property ?? prefix]: keyword }])
}

export function isCSSMathFn(value: string | undefined) {
  return value != null && cssMathFnRE.test(value)
}

export function isSize(str: string) {
  if (str[0] === '[' && str.slice(-1) === ']')
    str = str.slice(1, -1)
  return cssMathFnRE.test(str) || numberWithUnitRE.test(str)
}

export function transformXYZ(d: string, v: string, name: string): [string, string][] {
  const values: string[] = v.split(splitComma)
  if (d || (!d && values.length === 1))
    return xyzMap[d].map((i): [string, string] => [`--un-${name}${i}`, v])

  return values.map((v, i) => [`--un-${name}-${xyzArray[i]}`, v])
}

export function camelToHyphen(str: string) {
  return str.replace(/[A-Z]/g, '-$&').toLowerCase()
}
