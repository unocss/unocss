import type { CSSEntries, CSSObject, CSSPropertyValue, DynamicMatcher, DynamicRule, ParsedColorValue, RuleContext, StaticRule } from '@unocss/core'
import { escapeRegExp, hex2rgba, toArray } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from './handlers'
import { directionMap } from './mappings'

export function capitalize<T extends string>(str: T) {
  return str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<T>
}

/**
 * Provide {DynamicMatcher} function returning spacing definition. See spacing rules.
 *
 * @param {string} propertyPrefix - Property for the css value to be created. Postfix will be appended according to direction matched.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating expanded css values based on matched direction.
 * @see directionMap
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
 * Parse color string into rgba (if possible) + opacity.
 *
 * @param {string} body - Color string to be parsed
 * @param {Theme} theme
 * @return {ParsedColorValue | undefined}  {ParsedColorValue | undefined}
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
 * Provide {DynamicMatcher} function to produce color value matched from rule.
 *
 * @see ParsedColorValue
 *
 * @param {string} property - Property for the css value to be created.
 * @param {string} varName - Base name for the opacity variable.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating color value with opacity (if applicable).
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
 * Provide {DynamicMatcher} function to produce opacity value matched from rule.
 *
 * @param {string} varName - Base name for the opacity variable.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating opacity modifier.
 */
export const colorOpacityResolver = (varName: string): DynamicMatcher => ([, o]: string[]): CSSObject | undefined => {
  const v = h.bracket.percent.cssvar(o)
  if (v !== undefined)
    return { [`--un-${[varName]}-opacity`]: v }
}

/**
 * Create rule for parsing color. Rule will match: <@param name>-\<color name>.
 *
 * @param {string} name - Prefix for the rule.
 * @param {string} [property] - Property for the css value to be created. If omitted, @param name will be used.
 * @param {string} [varName] - Base name for the opacity variable. If omitted, @param name will be used.
 * @return {DynamicRule}  {DynamicRule} object.
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
 * @param {string} name - Prefix for the rule.
 * @param {string} [varName] - Base name for the opacity variable. If omitted, @param name will be used.
 * @return {DynamicRule}  {DynamicRule} object.
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
 * @param {string} [property] - Property for the css value to be created. If omitted, @param name will be used.
 * @param {string} [varName] - Base name for the opacity variable. If omitted, @param name will be used.
 * @return {DynamicRule[]}  {DynamicRule[]} object.
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
 * Provide {DynamicMatcher} function to produce css object from available keywords.
 *
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - Tuples with first element for matching and second element for property value.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating css object.
 */
export const keywordResolver = (properties: string | string[], keywords: CSSPropertyValue[] = []) => {
  const cache = Object.fromEntries(keywords.map(toArray))
  return ([, s]: string[]) => {
    if (s in cache)
      return generateCssObject(properties, cache[s] ?? s)
  }
}

/**
 * Provide {DynamicMatcher} function to produce css object from available keywords, and css values of inherit, initial, revert and unset.
 *
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - Tuples with first element for matching and second element for property value.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating css object.
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
 * @param {(string | string[])} names - Prefix for the rule.
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - Tuples with first element for matching and second element for property value.
 * @return {StaticRule[]}  {StaticRule[]} object.
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
 * @param {(string | string[])} names - Prefix for the rule.
 * @param {(string | string[])} properties - Properties for the css object.
 * @param {CSSPropertyValue[]} [keywords=[]] - Tuples with first element for matching and second element for property value.
 * @return {StaticRule[]}  {StaticRule[]} object.
 */
export const createGlobalKeywordRules = (names: string | string[], properties: string | string[], keywords: CSSPropertyValue[] = []): StaticRule[] =>
  createKeywordRules(names, properties, ['inherit', 'initial', 'revert', 'unset', ...keywords])

/**
 * Provide {DynamicMatcher} function to produce length value matched from rule. Handler used: bracket, auto, rem, fraction, percent & cssvar.
 *
 * @see ValueHandler
 *
 * @param {string} property - Property for the css object.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating opacity modifier.
 */
export const sizeRemResolver = (property: string): DynamicMatcher => ([, s]: string[]) => {
  const v = h.bracket.auto.rem.fraction.percent.cssvar(s)
  if (v !== undefined)
    return { [property]: v } as CSSObject
}

/**
 * Provide {DynamicMatcher} function to produce length value matched from rule. Handler used: bracket, px, cssvar.
 *
 * @see ValueHandler
 *
 * @param {string} property - Property for the css object.
 * @return {DynamicMatcher}  {DynamicMatcher} function for generating opacity modifier.
 */
export const sizePxResolver = (property: string): DynamicMatcher => ([, s]: string[]) => {
  const v = h.bracket.px.cssvar(s)
  if (v !== undefined)
    return { [property]: v } as CSSObject
}
