import type { TypographyColorScheme, TypographyCSSObject, TypographyOptions, TypographySizeScheme } from './types'
import { clone, mergeDeep, toArray } from '@unocss/core'
import { defaultColorScheme, modifiers, ProseDefaultSize } from './constants'

// #region Prose Color
export function resolveColorScheme(userColorScheme?: TypographyColorScheme): Required<TypographyColorScheme> {
  const scheme = clone(defaultColorScheme)

  if (userColorScheme) {
    for (const key in userColorScheme) {
      const [color, invertColor] = toArray(userColorScheme[key as keyof TypographyColorScheme])
      const [defaultColor, defaultInvertColor] = scheme[key as keyof TypographyColorScheme] as [string, string]
      scheme[key as keyof TypographyColorScheme] = [color ?? defaultColor, invertColor ?? defaultInvertColor]
    }
  }

  return scheme as Required<TypographyColorScheme>
}
// #endregion

// #region Prose Size
export function resolveSizeScheme(userSizeScheme?: TypographySizeScheme): TypographySizeScheme {
  if (userSizeScheme) {
    return mergeDeep(ProseDefaultSize, userSizeScheme)
  }
  return ProseDefaultSize
}
// #endregion

export function getCSS(preflights: TypographyCSSObject, options: TypographyOptions<any>): string {
  const selectorName = options.selectorName || 'prose'
  const notProseSelector = `:not(:where([class~="not-${selectorName}"],[class~="not-${selectorName}"] *))`
  const important = options.important === true
  // The default CSS object reads `--un-prose-*`; rename those reads to match the
  // variables declared with `cssVarPrefix`.
  const cssVarPrefix = options.cssVarPrefix ?? '--un-prose'
  const prefixVars = (value: unknown): string => cssVarPrefix === '--un-prose'
    ? `${value}`
    : `${value}`.replaceAll('--un-prose-', `${cssVarPrefix}-`)

  let css = ''

  for (const [selectorOrKey, cssObjectOrValue] of Object.entries(preflights)) {
    if (typeof cssObjectOrValue !== 'object') {
      css += `${prefixVars(selectorOrKey)}:${prefixVars(cssObjectOrValue)}${important ? ' !important' : ''};`
    }
    else {
      const [selectorOrGroup, pseudo] = selectorOrKey.split('::')
      const _selector = `:where(${selectorOrGroup})${notProseSelector}${pseudo ? `::${pseudo}` : ''}`
      css += `${_selector} {`
      for (const [key, value] of Object.entries(cssObjectOrValue)) {
        css += `${prefixVars(key)}:${prefixVars(value)}${important ? ' !important' : ''};`
      }
      css += `}`
    }
  }

  return css
}

// #region modifiers
export function getElements(modifier: string) {
  for (const [name, ...selectors] of modifiers) {
    if (name === modifier)
      return selectors.length > 0 ? selectors : [name]
  }
}
// #endregion
