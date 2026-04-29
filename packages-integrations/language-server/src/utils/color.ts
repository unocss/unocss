import type { Color } from 'vscode-languageserver-types'
import { colordx } from '@colordx/core'

const matchCssVarNameRE = /var\((?<cssVarName>--[^,|)]+)(?:,(?<fallback>[^)]+))?\)/g
const cssColorSource = String.raw`(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})\b|(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)`
const cssColorRE = new RegExp(cssColorSource, 'g')
const varFnRE = /var\((--[^,|)]+)(?:,([^)]+))?\)/
// Matches any CSS property ended with `-color`, includes `color`, `fill`, `stroke`.
// Covers all wind4 CSS custom properties like `--un-shadow-color`, `--un-ring-color`, etc.
const cssColorPropertyRE = /(?:^|[;{]\s*)(?:[\w-]+-color|color|fill|stroke)\s*:\s*(?<value>[^;}{]+)/gm
const colorMixWithWeightRE = new RegExp(
  // eslint-disable-next-line regexp/no-useless-assertions
  String.raw`color-mix\([^,]+,\s*(?<color>${cssColorSource})\s+(?<weight>\d+(?:\.\d+)?%)\s*,\s*transparent\s*\)`,
  'i',
)

function getCssVariables(code: string) {
  const regex = /(?<key>--[^\s:]+):(?<value>.+?)[!;]/g
  const cssVariables = new Map<string, string>()
  for (const match of code.matchAll(regex)) {
    const key = match.groups?.key
    if (key)
      cssVariables.set(key, match.groups?.value ?? '')
  }

  return cssVariables
}

function resolveVarToken(value: string, cssVars: Map<string, string>) {
  let nextValue = value.trim()

  while (nextValue.startsWith('var(')) {
    const varMatch = nextValue.match(varFnRE)
    if (!varMatch)
      break

    const varName = varMatch[1]
    const fallback = varMatch[2]?.trim()
    const cssVarValue = cssVars.get(varName)?.trim()
    if (cssVarValue) {
      nextValue = cssVarValue
      continue
    }

    if (fallback)
      return fallback

    return '1'
  }

  return nextValue
}

function resolveCssVars(value: string, cssVars: Map<string, string>) {
  let output = value
  for (const match of value.matchAll(matchCssVarNameRE)) {
    const matchedString = match[0]
    const cssVarName = match.groups?.cssVarName
    const fallback = match.groups?.fallback
    if (!cssVarName)
      continue

    const cssVarValue = cssVars.get(cssVarName)
    if (cssVarValue)
      output = output.replaceAll(matchedString, resolveVarToken(cssVarValue, cssVars))
    else if (fallback)
      output = output.replaceAll(matchedString, fallback)
  }

  return output.replaceAll(/,?\s+var\(--.*?\)/g, '')
}

function getColorStringFromValue(value: string, cssVars: Map<string, string>) {
  const resolvedValue = resolveCssVars(value, cssVars)

  // wind4 often emits `color-mix(..., <color> <weight>, transparent)`.
  // Keep the resolved color and carry through an explicit percentage weight as alpha.
  const colorMixMatch = resolvedValue.match(colorMixWithWeightRE)
  if (colorMixMatch?.groups?.color) {
    const colorFromMix = colorMixMatch.groups.color
    const weight = colorMixMatch.groups.weight
    if (colorFromMix) {
      return /\//.test(colorFromMix)
        ? colorFromMix
        : colorFromMix.replace(/\)$/, ` / ${weight})`)
    }
  }

  let colorString = resolvedValue.match(cssColorRE)?.[0]
  if (!colorString)
    return

  if (/\/\)/.test(colorString))
    colorString = colorString.replace(/ \/\)/g, '/ 1)')

  return colorString
}

/**
 * Get CSS color string from CSS string
 *
 * @example Input with CSS var
 * ```css
 *.dark [border="dark\:gray-700"] {
 *  --un-border-opacity: 1;
 *  border-color: rgb(55 65 81 / var(--un-border-opacity));
 *}
 * ```
 * return `rgb(55 65 81 / 1)`
 *
 * @example Input with no-value CSS var and its fallback value
 * ```css
 *.bg-brand-primary {
 *  background-color: hsl(217 78% 51% / var(--no-value, 0.5));
 *}
 * ```
 * return `hsl(217 78% 51% / 0.5)`
 *
 * @example Input with no-value CSS var
 * ```css
 *.bg-brand-primary {
 *  background-color: hsl(217 78% 51% / var(--no-value));
 *}
 * ```
 * return `rgb(217 78% 51%)`
 *
 * @param str - CSS string
 * @returns The **first** CSS color string (hex, rgb[a], hsl[a]) or `undefined`
 */
export function getColorString(str: string) {
  const cssVars = getCssVariables(str)

  for (const match of str.matchAll(cssColorPropertyRE)) {
    const value = match.groups?.value
    if (!value)
      continue

    const color = getColorStringFromValue(value, cssVars)
    if (color)
      return color
  }

  return getColorStringFromValue(str, cssVars)
}

export function parseColorToRGBA(colorString: string): Color | undefined {
  const color = colordx(colorString)
  if (!color.isValid())
    return undefined

  const rgb = color.toRgb()

  return {
    red: rgb.r / 255,
    green: rgb.g / 255,
    blue: rgb.b / 255,
    alpha: rgb.alpha,
  }
}
