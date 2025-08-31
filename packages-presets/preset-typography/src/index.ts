import type { CSSObject, Preset } from '@unocss/core'
import type { TypographyCSSObject, TypographyOptions, TypographyTheme } from './types'
import { definePreset, mergeDeep, symbols } from '@unocss/core'
import { alphaPlaceholders, colorToString } from '@unocss/rule-utils'
import { modifiers, ProseDefaultCSSObject, ProseDefaultSize } from './constants'
import { getCSS, getElements, resolveColorScheme, resolveSizeScheme } from './resolve'

export * from './types'

/**
 * UnoCSS Preset for Typography
 *
 * ```js
 * // uno.config.ts
 * import { presetAttributify, presetWind3/4, defineConfig, presetTypography } from 'unocss'
 *
 * export default defineConfig({
 *   presets: [
 *     presetWind3/4(), // required!
 *     presetAttributify(), // required if using attributify mode
 *     presetTypography()
 *   ]
 * })
 * ```
 *
 * @see https://unocss.dev/presets/typography
 * @returns typography preset
 * @public
 */
export const presetTypography = definePreset(<Theme extends TypographyTheme = TypographyTheme>(options?: TypographyOptions<Theme>): Preset<Theme> => {
  const selectorName = options?.selectorName ?? 'prose'
  const disableNotUtility = options?.compatibility?.noColonNot || options?.compatibility?.noColonWhere
  const cssVarPrefix = options?.cssVarPrefix ?? '--un-prose'
  const resolvedColorScheme = resolveColorScheme(options?.colorScheme)
  const resolvedSizeScheme = resolveSizeScheme(options?.sizeScheme)
  const extended = (entries: TypographyCSSObject, theme: Theme) => {
    const extend = typeof options?.cssExtend === 'function' ? options?.cssExtend(theme) : options?.cssExtend
    return mergeDeep(entries, extend ?? {})
  }
  const normalizeSelector = (s: string) => {
    if (typeof options?.important === 'string') {
      s = `${options.important} ${s}`
    }
    if (!options?.compatibility?.noColonIs) {
      s = `:is(${s})`
    }
    return s
  }

  // Regex
  const defaultRE = new RegExp(`^${selectorName}-default$`)
  const colorsRE = new RegExp(`^${selectorName}-([-\\w]+)$`)
  const sizeRE = new RegExp(`^${selectorName}-(${Object.keys(resolvedSizeScheme).join('|')})$`)

  return {
    name: '@unocss/preset-typography',
    enforce: 'post',
    layers: { typography: -20 },
    shortcuts: [
      [
        selectorName,
        [`${selectorName}-default`, `${selectorName}-gray`],
        { layer: 'typography' },
      ],
    ],
    rules: [
      [
        defaultRE,
        (_, { symbols, theme }) => {
          const entries = extended(mergeDeep(ProseDefaultCSSObject, ProseDefaultSize.base), theme)
          const css = getCSS(entries, options ?? {})
          return {
            [symbols.body]: css,
            [symbols.selector]: normalizeSelector,
          }
        },
        { layer: 'typography', autocomplete: 'prose', internal: true },
      ],
      // Colors
      [
        colorsRE,
        ([, color], { theme, symbols }) => {
          const baseColor = theme.colors?.[color] as Record<string, string> | string
          if (!baseColor || typeof baseColor !== 'object')
            return

          /**
           * Accent color palette names that only override link colors use [600, 500]
           */
          const ACCENT_COLORS = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']

          if (ACCENT_COLORS.includes(color)) {
            return {
              [`${cssVarPrefix}-links`]: baseColor['600'],
              [`${cssVarPrefix}-invert-links`]: baseColor['500'],
              [symbols.selector]: normalizeSelector,
            }
          }
          else {
            return Object.entries(resolvedColorScheme).reduce((acc, [key, value]) => {
              const [colorKey, invertKey] = value as [string, string]
              const resolve = (key: string) => baseColor[key] ?? theme[key as keyof Theme] ?? key
              const color = resolve(colorKey)
              const invertColor = resolve(invertKey)
              const cssVarColorKey = `${cssVarPrefix}-${key}`
              const cssVarInvertColorKey = `${cssVarPrefix}-invert-${key}`

              acc[cssVarColorKey] = colorToString(color, `var(${cssVarColorKey}-opacity)`)
              acc[cssVarInvertColorKey] = colorToString(invertColor, `var(${cssVarInvertColorKey}-opacity)`)

              for (const [c, k] of [[color, `${cssVarColorKey}-opacity`], [invertColor, `${cssVarInvertColorKey}-opacity`]]) {
                if (alphaPlaceholders.some(p => c.includes(p)))
                  acc[k] = '1'
              }

              return acc
            }, {
              [symbols.selector]: normalizeSelector,
            } as CSSObject)
          }
        },
        { layer: 'typography', autocomplete: `${selectorName}-$colors` },
      ],
      // Size
      [
        sizeRE,
        ([, size], { symbols, theme }) => {
          const css = getCSS(extended(resolvedSizeScheme[size], theme), options ?? {})

          return {
            [symbols.body]: css,
            [symbols.selector]: (selector) => {
              if (typeof options?.important === 'string') {
                selector = `${options.important} ${selector}`
              }
              if (!options?.compatibility?.noColonIs) {
                selector = `:is(${selector})`
              }
              return selector
            },
          }
        },
        { layer: 'typography', autocomplete: `${selectorName}-(${Object.keys(resolvedSizeScheme).join('|')})` },
      ],
      // Invert
      [
        `${selectorName}-invert`,
        [
          {
            [`${cssVarPrefix}-body`]: `var(${cssVarPrefix}-invert-body)`,
            [`${cssVarPrefix}-headings`]: `var(${cssVarPrefix}-invert-headings)`,
            [`${cssVarPrefix}-lead`]: `var(${cssVarPrefix}-invert-lead)`,
            [`${cssVarPrefix}-links`]: `var(${cssVarPrefix}-invert-links)`,
            [`${cssVarPrefix}-bold`]: `var(${cssVarPrefix}-invert-bold)`,
            [`${cssVarPrefix}-counters`]: `var(${cssVarPrefix}-invert-counters)`,
            [`${cssVarPrefix}-bullets`]: `var(${cssVarPrefix}-invert-bullets)`,
            [`${cssVarPrefix}-hr`]: `var(${cssVarPrefix}-invert-hr)`,
            [`${cssVarPrefix}-quotes`]: `var(${cssVarPrefix}-invert-quotes)`,
            [`${cssVarPrefix}-quote-borders`]: `var(${cssVarPrefix}-invert-quote-borders)`,
            [`${cssVarPrefix}-captions`]: `var(${cssVarPrefix}-invert-captions)`,
            [`${cssVarPrefix}-kbd`]: `var(${cssVarPrefix}-invert-kbd)`,
            [`${cssVarPrefix}-kbd-shadows`]: `var(${cssVarPrefix}-invert-kbd-shadows)`,
            [`${cssVarPrefix}-code`]: `var(${cssVarPrefix}-invert-code)`,
            [`${cssVarPrefix}-pre-code`]: `var(${cssVarPrefix}-invert-pre-code)`,
            [`${cssVarPrefix}-pre-bg`]: `var(${cssVarPrefix}-invert-pre-bg)`,
            [`${cssVarPrefix}-th-borders`]: `var(${cssVarPrefix}-invert-th-borders)`,
            [`${cssVarPrefix}-td-borders`]: `var(${cssVarPrefix}-invert-td-borders)`,
            [symbols.selector]: normalizeSelector,
          },
        ],
        { layer: 'typography' },
      ],
    ],
    variants: [
      {
        name: 'typography element modifiers',
        match: (matcher) => {
          if (matcher.startsWith(`${selectorName}-`)) {
            const modifyRe = new RegExp(`^${selectorName}-(\\w+)[:-].+$`)
            const modifier = matcher.match(modifyRe)?.[1]
            if (modifier) {
              const elements = getElements(modifier)
              if (elements?.length) {
                return {
                  matcher: matcher.slice(selectorName.length + modifier.length + 2),
                  selector: (s) => {
                    const notProseSelector = `:not(:where([class~="not-${selectorName}"],[class~="not-${selectorName}"] *))`
                    const escapedSelector = disableNotUtility
                      ? elements.map(e => `${s} ${e}`).join(',')
                      : `${s} :is(:where(${elements})${notProseSelector})`
                    return escapedSelector
                  },
                }
              }
            }
          }
        },
        autocomplete: `${selectorName}-(${modifiers.map(m => `${m[0]}:`).join('|')})`,
      },
    ],
  }
})

export default presetTypography
