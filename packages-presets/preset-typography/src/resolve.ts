import type { TypographyColorScheme, TypographyCSSObject, TypographyOptions, TypographySizeScheme } from './types'
import { getEnvFlags } from '#integration/env'
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
      const [selectorOrGroup, pseudo] = selectorOrKey.split('::')
      const _selector = `:where(${selectorOrGroup})${notProseSelector}${pseudo ? `::${pseudo}` : ''}`
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

// #region Compatibility nest css
export async function destructCSS(selector: string, css: string): Promise<string> {
  const code = `${selector} { ${css} }`
  const { isNode } = getEnvFlags()

  if (!isNode) {
    console.warn('[preset-typography] destruct nest CSS is only supported in Node environment. Returning original CSS code.')
    return code
  }

  try {
    const Buffer = (await import('node:buffer')).Buffer
    const { transform } = await import('lightningcss')
    const result = transform({
      code: Buffer.from(code),
      filename: `${selector}.css`,
      minify: false,
      sourceMap: false,
      targets: {
        safari: (16 << 16),
      },
    })

    return result.code.toString()
  }
  catch (error) {
    console.warn('[preset-typography] Failed to destruct nest CSS. Returning original CSS code.', error)
    return code
  }
}
// #endregion
