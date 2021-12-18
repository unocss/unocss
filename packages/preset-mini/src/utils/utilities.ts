import type { CSSEntries, CSSObject, CSSPropertyValue, DynamicMatcher, DynamicRule, ParsedColorValue, RuleContext, StaticRule } from '@unocss/core'
import { escapeRegExp, hex2rgba, toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from './handlers'
import { directionMap } from './mappings'

export function capitalize<T extends string>(str: T) {
  return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>
}

/**
 * Provide {@link DynamicMatcher} function returning spacing definition. See spacing rules.
 *
 * @param {string} propertyPrefix - Property for the css value to be created. Postfix will be appended according to direction matched.
 * @return {DynamicMatcher}  {@link DynamicMatcher}
 * @see {@link directionMap}
 */
export const directionSize = (propertyPrefix: string): DynamicMatcher => ([_, direction, size]: string[]): CSSEntries | undefined => {
  const v = h.bracket.auto.rem.fraction.cssvar(size)
  if (v !== undefined)
    return directionMap[direction].map(i => [`${propertyPrefix}${i}`, v])
}

/**
 * Obtain color from theme by camel-casing colors.
 */
const getThemeColor = (theme: Theme, colors: string[]) =>
  theme.colors?.[
    colors.join('-').replace(/(-[a-z])/g, n => n.slice(1).toUpperCase())
  ]

/**
 * Parse color string into rgba (if possible) with opacity opacity. Color value will be matched to theme object before converting to rgb value.
 *
 * @example Parseable strings:
 * 'red' // From theme, if 'red' is available
 * 'red-100' // From theme, plus scale
 * 'red-100/20' // From theme, plus scale/opacity
 * '#f12' // Hex color
 * 'hex-f12' // Alternative hex color
 * '[rgb(100,2,3)]/[var(--op)]' // Bracket with rgb color and bracket with opacity
 *
 * @param {string} body - Color string to be parsed.
 * @param {Theme} theme - {@link Theme} object.
 * @return {ParsedColorValue|undefined}  {@link ParsedColorValue} object if string is parseable.
 */
export const parseColor = (body: string, theme: Theme): ParsedColorValue | undefined => {
  const [main, opacity] = body.split(/(?:\/|:)/)
  const colors = main
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .split(/-/g)
  const [name] = colors

  if (!name)
    return

  let color: string | undefined
  const bracket = h.bracket(main)
  const bracketOrMain = bracket || main

  if (bracketOrMain.startsWith('#'))
    color = bracketOrMain.slice(1)
  if (bracketOrMain.startsWith('hex-'))
    color = bracketOrMain.slice(4)

  color = color || bracket

  let no = 'DEFAULT'
  if (!color) {
    let colorData
    const [scale] = colors.slice(-1)
    if (scale.match(/^\d+$/)) {
      no = scale
      colorData = getThemeColor(theme, colors.slice(0, -1))
    }
    else {
      colorData = getThemeColor(theme, colors)
      if (!colorData) {
        [, no = no] = colors
        colorData = getThemeColor(theme, [name])
      }
    }

    if (typeof colorData === 'string')
      color = colorData
    else if (no && colorData)
      color = colorData[no]
  }

  return {
    opacity,
    name,
    no,
    color,
    rgba: hex2rgba(color),
  }
}

/**
 * Provide {@link DynamicMatcher} function to produce color value matched from rule.
 *
 * @see {@link ParsedColorValue}
 * @see {@link parseColor}
 *
 * @example Resolving 'red' from theme:
 * colorResolver('background-color', 'background')('', 'red')
 * return { 'background-color': '#f12' }
 *
 * @example Resolving 'red-100' from theme:
 * colorResolver('background-color', 'background')('', 'red-100')
 * return { '--un-background-opacity': '1', 'background-color': 'rgba(254,226,226,var(--un-bg-opacity))' }
 *
 * @example Resolving 'red-100/20' from theme:
 * colorResolver('background-color', 'background')('', 'red-100/20')
 * return { 'background-color': 'rgba(204,251,241,0.22)' }
 *
 * @example Resolving 'hex-124':
 * colorResolver('color', 'text')('', 'hex-124')
 * return { '--un-text-opacity': '1', 'color': 'rgba(17,34,68,var(--un-text-opacity))' }
 *
 * @param {string} property - Property for the css value to be created.
 * @param {string} varName - Base name for the opacity variable.
 * @return {DynamicMatcher}  {@link DynamicMatcher} object.
 */
export const colorResolver = (property: string, varName: string) => ([, body]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { opacity, color, rgba } = data

  if (!color)
    return

  const a = opacity
    ? opacity[0] === '['
      ? h.bracket.percent(opacity)!
      : (parseFloat(opacity) / 100)
    : rgba?.[3]

  if (rgba) {
    if (a != null && !Number.isNaN(a)) {
      // @ts-expect-error
      rgba[3] = typeof a === 'string' && !a.includes('%')
        ? parseFloat(a)
        : a
      return {
        [property]: `rgba(${rgba.join(',')})`,
      }
    }
    else {
      return {
        [`--un-${varName}-opacity`]: 1,
        [property]: `rgba(${rgba.slice(0, 3).join(',')},var(--un-${varName}-opacity))`,
      }
    }
  }
  else {
    return {
      [property]: color.replace('%alpha', `${a || 1}`),
    }
  }
}

/**
 * Provide {@link DynamicMatcher} function to produce opacity value matched from rule.
 *
 * @see Example #2 from {@link colorResolver}.
 *
 * @example Resolving '20':
 * colorOpacityResolver('background')('', '20')
 * return { '--un-background-opacity': '0.2' }
 *
 * @param {string} varName - Base name for the opacity variable.
 * @return {DynamicMatcher}  {@link DynamicMatcher} object.
 */
export const colorOpacityResolver = (varName: string): DynamicMatcher => ([, o]: string[]): CSSObject | undefined => {
  const v = h.bracket.percent.cssvar(o)
  if (v !== undefined)
    return { [`--un-${[varName]}-opacity`]: v }
}

/**
 * Create rule for parsing color. Rule will match: <@param name>-\<color name>.
 *
 * @example
 * createColorRule('bg', 'background-color', 'background')
 * return [/^bg-(.+)$/, colorResolver('background-color', 'background')]
 *
 * @see {@link colorResolver}
 *
 * @param {string} name - Prefix for the rule.
 * @param {string} [property] - Property for the css value to be created. If omitted, {@link name} will be used.
 * @param {string} [varName] - Base name for the opacity variable. If omitted, {@link name} will be used.
 * @return {DynamicRule}  {@link DynamicRule} object.
 */
export const createColorRule = (name: string, property?: string, varName?: string): DynamicRule => [
  new RegExp(`^${escapeRegExp(name)}-(.+)$`),
  colorResolver(property ?? name, varName ?? name),
]

/**
 * Create rule for parsing opacity. Rule will match:
 * - <@param name>-opacity-\<opacity>
 * - <@param name>-opacity\<opacity>
 * - <@param name>-op-\<opacity>
 * - <@param name>-op\<opacity>
 *
 * @example
 * createColorOpacityRule('bg', 'background')
 * return [/^bg-op(?:acity)?-?(.+)$/, colorOpacityResolver('background')]
 *
 * @see {@link colorOpacityResolver}
 *
 * @param {string} name - Prefix for the rule.
 * @param {string} [varName] - Base name for the opacity variable. If omitted, {@link name} will be used.
 * @return {DynamicRule}  {@link DynamicRule} object.
 */
export const createColorOpacityRule = (name: string, varName?: string): DynamicRule => [
  new RegExp(`^${escapeRegExp(name)}-op(?:acity)?-?(.+)$`),
  colorOpacityResolver(varName ?? name),
]

/**
 * Create a pair of rules for parsing color and opacity.
 * @see createColorRule
 * @see createColorOpacityRule
 *
 * @param {string} name - Prefix for the rule.
 * @param {string} [property] - Property for the css value to be created. If omitted, {@link name} will be used.
 * @param {string} [varName] - Base name for the opacity variable. If omitted, {@link name} will be used.
 * @return {DynamicRule[]}  Two {@link DynamicRule} objects.
 */
export const createColorAndOpacityRulePair = (name: string, prop?: string, varName?: string): DynamicRule[] => [
  createColorRule(name, prop, varName),
  createColorOpacityRule(name, varName),
]

/**
 * Create CSSObject from multiple properties with the same value.
 */
function generateCssObject(properties: string | string[], value: string | number) {
  if (typeof properties === 'string')
    return { [properties]: value }

  const css: CSSObject = {}
  properties.forEach(prop => css[prop] = value)
  return css
}

/**
 * Provide {@link DynamicMatcher} function to produce css object from available keywords.
 *
 * @example Resolving 'red':
 * keywordResolver('background-color', ['red'])('', 'red')
 * return { 'background-color': 'red' }
 *
 * @example Resolving 'reddish':
 * keywordResolver('background-color', [['reddish', '#f12']])('', 'reddish')
 * return { 'background-color': '#f12' }
 *
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - {@link CSSPropertyValue} tuples with first element for matching and second element for property value.
 * @return {DynamicMatcher}  {@link DynamicMatcher} object.
 */
export const keywordResolver = (properties: string | string[], keywords: CSSPropertyValue[] = []) => {
  const cache = Object.fromEntries(keywords.map(toArray))
  return ([, s]: string[]) => {
    if (s in cache)
      return generateCssObject(properties, cache[s] ?? s)
  }
}

/**
 * Provide {@link DynamicMatcher} function to produce css object from available keywords, and css values of inherit, initial, revert and unset.
 *
 * @see {@link keywordResolver}
 *
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - {@link CSSPropertyValue} tuples with first element for matching and second element for property value.
 * @return {DynamicMatcher}  {@link DynamicMatcher} object.
 */
export const globalKeywordResolver = (properties: string | string[], keywords: CSSPropertyValue[] = []) => {
  const cache = Object.fromEntries(keywords.map(toArray))
  return ([, s]: string[]) => {
    const v = s in cache ? (cache[s] ?? s) : h.global(s)
    if (v !== undefined)
      return generateCssObject(properties, v)
  }
}

/**
 * Create rules for generating css object from matching keywords.
 *
 * @example
 * createKeywordRules('bg', 'background-repeat', ['repeat', 'no-repeat'])
 * return [
 *     ['bg-repeat', { 'background-repeat': 'repeat' }],
 *     ['bg-no-repeat', { 'background-repeat': 'no-repeat' }],
 * ]
 *
 * @see {@link keywordResolver}
 *
 * @param {(string | string[])} names - Prefix for the rule.
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - {@link CSSPropertyValue} tuples with first element for matching and second element for property value.
 * @return {StaticRule[]}  {@link StaticRule} objects.
 */
export const createKeywordRules = (names: string | string[], properties: string | string[], keywords: CSSPropertyValue[] = []) =>
  keywords
    .map(key => typeof key === 'string' ? [key, key] : key)
    .map(([k, v]) => {
      if (typeof names === 'string')
        names = [names]
      return names.map(base => [`${base}-${k}`, generateCssObject(properties, v)] as StaticRule)
    })
    .flat(1)

/**
 * Create rules for generating css object from matching keywords, and css values of inherit, initial, revert and unset.
 *
 * @see {@link globalKeywordResolver}
 * @see {@link createKeywordRules}
 *
 * @param {(string | string[])} names - Prefix for the rule.
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - {@link CSSPropertyValue} tuples with first element for matching and second element for property value.
 * @return {StaticRule[]}  {@link StaticRule} objects.
 */
export const createGlobalKeywordRules = (names: string | string[], properties: string | string[], keywords: CSSPropertyValue[] = []): StaticRule[] =>
  createKeywordRules(names, properties, ['inherit', 'initial', 'revert', 'unset', ...keywords])

/**
 * Provide {@link DynamicMatcher} function to produce length value matched from rule. Handler used: bracket, auto, rem, fraction, percent & cssvar.
 *
 * @example
 * sizeRemResolver('top')('', '2')
 * return { 'top': '0.5rem' }
 *
 * @see {@link ValueHandler}
 *
 * @param {string} property - Property for the css object.
 * @return {DynamicMatcher}  {@link DynamicMatcher} object.
 */
export const sizeRemResolver = (property: string): DynamicMatcher => ([, s]: string[]) => {
  const v = h.bracket.auto.rem.fraction.percent.cssvar(s)
  if (v !== undefined)
    return { [property]: v } as CSSObject
}

/**
 * Provide {@link DynamicMatcher} function to produce length value matched from rule. Handler used: bracket, px, cssvar.
 *
 * @example
 * sizePxResolver('top')('', '2')
 * return { 'top': '2px' }
 *
 * @see {@link ValueHandler}
 *
 * @param {string} property - Property for the css object.
 * @return {DynamicMatcher}  {@link DynamicMatcher} object.
 */
export const sizePxResolver = (property: string): DynamicMatcher => ([, s]: string[]) => {
  const v = h.bracket.px.cssvar(s)
  if (v !== undefined)
    return { [property]: v } as CSSObject
}
