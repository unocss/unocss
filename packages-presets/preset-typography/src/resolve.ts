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

  let css = ''

  for (const [selectorOrKey, cssObjectOrValue] of Object.entries(preflights)) {
    if (typeof cssObjectOrValue !== 'object') {
      css += `${selectorOrKey}:${cssObjectOrValue}${important ? ' !important' : ''};`
    }
    else {
      const _selector = `:where(${selectorOrKey})${notProseSelector}`
      css += `${_selector} {`
      for (const [key, value] of Object.entries(cssObjectOrValue)) {
        css += `${key}:${value}${important ? ' !important' : ''};`
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
