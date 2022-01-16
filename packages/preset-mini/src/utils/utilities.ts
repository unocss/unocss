import type { CSSEntries, CSSObject, DynamicMatcher, ParsedColorValue, RuleContext } from '@unocss/core'
import { hex2rgba } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h } from './handlers'
import { directionMap } from './mappings'

/**
 * Provide {@link DynamicMatcher} function returning spacing definition. See spacing rules.
 *
 * @param {string} propertyPrefix - Property for the css value to be created. Postfix will be appended according to direction matched.
 * @return {DynamicMatcher}  {@link DynamicMatcher}
 * @see {@link directionMap}
 */
export const directionSize = (propertyPrefix: string): DynamicMatcher => ([_, direction, size]: string[]): CSSEntries | undefined => {
  const v = h.bracket.cssvar.auto.fraction.rem(size)
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
 * Parse color string into rgba (if possible) with opacity. Color value will be matched to theme object before converting to rgb value.
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
  else if (bracketOrMain.startsWith('hex-'))
    color = bracketOrMain.slice(4)
  else if (main.startsWith('$'))
    color = h.cssvar(main)

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

  const rgba = hex2rgba(color)

  const alpha = opacity
    ? opacity[0] === '['
      ? h.bracket.percent(opacity)!
      : (parseFloat(opacity) / 100)
    : rgba?.[3]

  const hasAlpha = alpha != null && !Number.isNaN(alpha)
  if (rgba) {
    if (hasAlpha) {
      rgba[3] = typeof alpha === 'string' && !alpha.includes('%')
        ? parseFloat(alpha)
        : alpha as number
    }
    else {
      rgba.splice(3)
    }
  }

  return {
    opacity,
    name,
    no,
    color,
    rgba,
    alpha: hasAlpha ? alpha : undefined,
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
export const colorResolver = (property: string, varName: string): DynamicMatcher => ([, body]: string[], { theme }: RuleContext<Theme>): CSSObject | undefined => {
  const data = parseColor(body, theme)

  if (!data)
    return

  const { alpha, opacity, color, rgba } = data

  if (!color)
    return

  if (rgba) {
    if (alpha != null) {
      return {
        [property]: `rgba(${rgba.join(',')})`,
      }
    }
    else {
      return {
        [`--un-${varName}-opacity`]: (opacity && h.cssvar(opacity)) ?? 1,
        [property]: `rgba(${rgba.join(',')},var(--un-${varName}-opacity))`,
      }
    }
  }
  else {
    return {
      [property]: color.replace('%alpha', `${alpha || 1}`),
    }
  }
}
