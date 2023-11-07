import type { CSSEntries, CSSObject, DynamicMatcher, ParsedColorValue, RuleContext, StaticRule, VariantContext } from '@unocss/core'
import { toArray } from '@unocss/core'
import { colorOpacityToString, colorToString, getStringComponents, parseCssColor } from '@unocss/rule-utils'
import type { Theme } from '../theme'
import { h } from './handlers'
import { cssMathFnRE, directionMap, globalKeywords } from './mappings'
import { numberWithUnitRE } from './handlers/regex'

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
    if (v != null)
      return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
  }
}

/**
 * Obtain color from theme by camel-casing colors.
 */
function getThemeColor(theme: Theme, colors: string[]) {
  let obj: Theme['colors'] | string = theme.colors
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
 * Split utility shorthand delimited by / or :
 */
export function splitShorthand(body: string, type: string) {
  const split = body.split(/(?:\/|:)/)

  if (split[0] === `[${type}`) {
    return [
      split.slice(0, 2).join(':'),
      split[2],
    ]
  }

  return split
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
export function parseColor(body: string, theme: Theme): ParsedColorValue | undefined {
  const [main, opacity] = splitShorthand(body, 'color')

  const colors = main
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .split(/-/g)
  const [name] = colors

  if (!name)
    return

  let color: string | undefined
  const bracket = h.bracketOfColor(main)
  const bracketOrMain = bracket || main

  if (h.numberWithUnit(bracketOrMain))
    return

  if (bracketOrMain.match(/^#[\da-fA-F]+/g))
    color = bracketOrMain
  else if (bracketOrMain.match(/^hex-[\da-fA-F]+/g))
    color = `#${bracketOrMain.slice(4)}`
  else if (main.startsWith('$'))
    color = h.cssvar(main)

  color = color || bracket

  if (!color) {
    const colorData = getThemeColor(theme, [main])
    if (typeof colorData === 'string')
      color = colorData
  }

  let no = 'DEFAULT'
  if (!color) {
    let colorData
    const [scale] = colors.slice(-1)
    if (scale.match(/^\d+$/)) {
      no = scale
      colorData = getThemeColor(theme, colors.slice(0, -1))
      if (!colorData || typeof colorData === 'string')
        color = undefined
      else
        color = colorData[no] as string
    }
    else {
      colorData = getThemeColor(theme, colors)
      if (!colorData && colors.length <= 2) {
        [, no = no] = colors
        colorData = getThemeColor(theme, [name])
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
 * @param [shouldPass] - Function to decide whether to pass the css.
 * @return object.
 */
export function colorResolver(property: string, varName: string, shouldPass?: (css: CSSObject) => boolean): DynamicMatcher {
  return ([, body]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined => {
    const data = parseColor(body, theme)

    if (!data)
      return

    const { alpha, color, cssColor } = data

    const css: CSSObject = {}
    if (cssColor) {
      if (alpha != null) {
        css[property] = colorToString(cssColor, alpha)
      }
      else {
        css[`--un-${varName}-opacity`] = colorOpacityToString(cssColor)
        css[property] = colorToString(cssColor, `var(--un-${varName}-opacity)`)
      }
    }
    else if (color) {
      css[property] = colorToString(color, alpha)
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
    const color = parseCssColor(components.pop())
    if (color == null)
      return shadows
    colored.push(`${components.join(' ')} var(${colorVar}, ${colorToString(color)})`)
  }
  return colored
}

export function hasParseableColor(color: string | undefined, theme: Theme) {
  return color != null && !!parseColor(color, theme)?.color
}

export function resolveBreakpoints({ theme, generator }: Readonly<VariantContext<Theme>>, key: 'breakpoints' | 'verticalBreakpoints' = 'breakpoints') {
  let breakpoints: Record<string, string> | undefined
  if (generator.userConfig && generator.userConfig.theme)
    breakpoints = (generator.userConfig.theme as any)[key]

  if (!breakpoints)
    breakpoints = theme[key]

  return breakpoints
    ? Object.entries(breakpoints)
      .sort((a, b) => Number.parseInt(a[1].replace(/[a-z]+/gi, '')) - Number.parseInt(b[1].replace(/[a-z]+/gi, '')))
      .map(([point, size]) => ({ point, size }))
    : undefined
}

export function resolveVerticalBreakpoints(context: Readonly<VariantContext<Theme>>) {
  return resolveBreakpoints(context, 'verticalBreakpoints')
}

export function makeGlobalStaticRules(prefix: string, property?: string): StaticRule[] {
  return globalKeywords.map(keyword => [`${prefix}-${keyword}`, { [property ?? prefix]: keyword }])
}

export function isCSSMathFn(value: string) {
  return cssMathFnRE.test(value)
}

export function isSize(str: string) {
  if (str[0] === '[' && str.slice(-1) === ']')
    str = str.slice(1, -1)
  return cssMathFnRE.test(str) || numberWithUnitRE.test(str)
}
