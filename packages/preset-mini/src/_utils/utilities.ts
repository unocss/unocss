import type { CSSEntries, CSSObject, DynamicMatcher, RuleContext, StaticRule, VariantContext } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { ParsedColorValue } from '@unocss/rule-utils'
import { colorOpacityToString, colorToString, getStringComponent, getStringComponents, parseCssColor } from '@unocss/rule-utils'
import type { Theme } from '../theme'
import { h } from './handlers'
import { cssMathFnRE, cssVarFnRE, directionMap, globalKeywords, xyzArray, xyzMap } from './mappings'
import { bracketTypeRe, numberWithUnitRE, splitComma } from './handlers/regex'

export const CONTROL_MINI_NO_NEGATIVE = '$$mini-no-negative'

/**
 * Provide {@link DynamicMatcher} function returning spacing definition. See spacing rules.
 *
 * @param propertyPrefix - Property for the css value to be created. Postfix will be appended according to direction matched.
 * @see {@link directionMap}
 */
export function directionSize(propertyPrefix: string): DynamicMatcher {
  return ([_, direction, size]: string[], { theme }: RuleContext<Theme>): CSSEntries | undefined => {
    const v = theme.spacing?.[size || 'DEFAULT'] ?? h.bracket.cssvar.global.auto.fraction.rem(size)

    if (v != null) {
      return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
    }
    else if (size?.startsWith('-')) {
      // --custom-spacing-value
      const v = theme.spacing?.[size.slice(1)]
      if (v != null)
        return directionMap[direction].map(i => [`${propertyPrefix}${i}`, `calc(${v} * -1)`])
    }
  }
}

type ThemeColorKeys = 'colors' | 'borderColor' | 'backgroundColor' | 'textColor' | 'shadowColor' | 'accentColor'

function getThemeColorForKey(theme: Theme, colors: string[], key: ThemeColorKeys = 'colors') {
  let obj = theme[key] as Theme['colors'] | string
  let index = -1

  for (const c of colors) {
    index += 1
    if (obj && typeof obj !== 'string') {
      const camel = colors.slice(index).join('-').replace(/(-[a-z])/g, n => n.slice(1).toUpperCase())
      if (obj[camel])
        return obj[camel]

      if (obj[c]) {
        obj = obj[c]
        continue
      }
    }
    return undefined
  }

  return obj
}

/**
 * Obtain color from theme by camel-casing colors.
 */
function getThemeColor(theme: Theme, colors: string[], key?: ThemeColorKeys) {
  return getThemeColorForKey(theme, colors, key) || getThemeColorForKey(theme, colors, 'colors')
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
export function parseColor(body: string, theme: Theme, key?: ThemeColorKeys): ParsedColorValue | undefined {
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

  let color: string | undefined
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

  if (!color) {
    const colorData = getThemeColor(theme, [main], key)
    if (typeof colorData === 'string')
      color = colorData
  }

  let no = 'DEFAULT'
  if (!color) {
    let colorData
    const [scale] = colors.slice(-1)
    if (/^\d+$/.test(scale)) {
      no = scale
      colorData = getThemeColor(theme, colors.slice(0, -1), key)
      if (!colorData || typeof colorData === 'string')
        color = undefined
      else
        color = colorData[no] as string
    }
    else {
      colorData = getThemeColor(theme, colors, key)
      if (!colorData && colors.length <= 2) {
        [, no = no] = colors
        colorData = getThemeColor(theme, [name], key)
      }
      if (typeof colorData === 'string')
        color = colorData
      else if (no && colorData)
        color = colorData[no] as string
    }
  }

  return {
    opacity,
    name,
    no,
    color,
    cssColor: parseCssColor(color),
    alpha: h.bracket.cssvar.percent(opacity ?? ''),
  }
}

/**
 * Provide {@link DynamicMatcher} function to produce color value matched from rule.
 *
 * @see {@link parseColor}
 *
 * @example Resolving 'red' from theme:
 * colorResolver('background-color', 'background')('', 'red')
 * return { 'background-color': '#f12' }
 *
 * @example Resolving 'red-100' from theme:
 * colorResolver('background-color', 'background')('', 'red-100')
 * return { '--un-background-opacity': '1', 'background-color': 'rgb(254 226 226 / var(--un-background-opacity))' }
 *
 * @example Resolving 'red-100/20' from theme:
 * colorResolver('background-color', 'background')('', 'red-100/20')
 * return { 'background-color': 'rgb(204 251 241 / 0.22)' }
 *
 * @example Resolving 'hex-124':
 * colorResolver('color', 'text')('', 'hex-124')
 * return { '--un-text-opacity': '1', 'color': 'rgb(17 34 68 / var(--un-text-opacity))' }
 *
 * @param property - Property for the css value to be created.
 * @param varName - Base name for the opacity variable.
 * @param [key] - Theme key to select the color from.
 * @param [shouldPass] - Function to decide whether to pass the css.
 * @return object.
 */
export function colorResolver(property: string, varName: string, key?: ThemeColorKeys, shouldPass?: (css: CSSObject) => boolean): DynamicMatcher {
  return ([, body]: string[], { theme, generator }: RuleContext<Theme>): CSSObject | undefined => {
    const data = parseColor(body, theme, key)

    if (!data)
      return

    const { alpha, color, cssColor } = data
    const isDev = generator.config.envMode === 'dev'
    const rawColorComment = isDev && color ? ` /* ${color} */` : ''
    const css: CSSObject = {}
    if (cssColor) {
      if (alpha != null) {
        css[property] = colorToString(cssColor, alpha) + rawColorComment
      }
      else {
        const opacityVar = `--un-${varName}-opacity`
        const result = colorToString(cssColor, `var(${opacityVar})`)
        if (result.includes(opacityVar))
          css[opacityVar] = colorOpacityToString(cssColor)
        css[property] = result + rawColorComment
      }
    }
    else if (color) {
      if (alpha != null) {
        css[property] = colorToString(color, alpha) + rawColorComment
      }
      else {
        const opacityVar = `--un-${varName}-opacity`
        const result = colorToString(color, `var(${opacityVar})`)
        if (result.includes(opacityVar))
          css[opacityVar] = 1
        css[property] = result + rawColorComment
      }
    }

    if (shouldPass?.(css) !== false)
      return css
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

export function hasParseableColor(color: string | undefined, theme: Theme, key: ThemeColorKeys) {
  return color != null && !!parseColor(color, theme, key)?.color
}

const reLetters = /[a-z]+/gi
const resolvedBreakpoints = new WeakMap<any, { point: string, size: string }[]>()

export function resolveBreakpoints({ theme, generator }: Readonly<VariantContext<Theme>>, key: 'breakpoints' | 'verticalBreakpoints' = 'breakpoints') {
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
  return resolveBreakpoints(context, 'verticalBreakpoints')
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
