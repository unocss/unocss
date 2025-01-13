import type { CSSObject, Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import type { TypographyCompatibilityOptions } from './types/compatibilityOptions'
import { definePreset, toEscapedSelector } from '@unocss/core'
import { getElements, getPreflights } from './preflights'

/**
 * @public
 */
export interface TypographyOptions {
  /**
   * The selector name to use the typographic utilities.
   * To undo the styles to the elements, use it like
   * `not-${selectorName}` which is by default `not-prose`.
   *
   * Note: `not` utility is only available in class mode.
   *
   * @default `prose`
   */
  selectorName?: string

  /**
   * Extend or override CSS selectors with CSS declaration block.
   *
   * @default undefined
   */
  cssExtend?: Record<string, CSSObject> | ((theme: Theme) => Record<string, CSSObject>)

  /**
   * Compatibility option. Notice that it will affect some features.
   * For more instructions, see
   * [README](https://github.com/unocss/unocss/tree/main/packages-presets/preset-typography)
   *
   * @default undefined
   */
  compatibility?: TypographyCompatibilityOptions

  /**
   * @deprecated use `selectorName` instead. It will be removed in 1.0.
   */
  className?: string

  /**
   * Control whether prose's utilities should be marked with !important.
   *
   * @default false
   */
  important?: boolean | string
}

/**
 * UnoCSS Preset for Typography
 *
 * ```js
 * // uno.config.ts
 * import { presetAttributify, presetUno, defineConfig, presetTypography } from 'unocss'
 *
 * export default defineConfig({
 *   presets: [
 *     presetAttributify(), // required if using attributify mode
 *     presetUno(), // required
 *     presetTypography()
 *   ]
 * })
 * ```
 *
 * @see https://unocss.dev/presets/typography
 * @returns typography preset
 * @public
 */
export const presetTypography = definePreset((options?: TypographyOptions): Preset<Theme> => {
  if (options?.className)
    console.warn('[unocss:preset-typography] "className" is deprecated. Please use "selectorName" instead.')

  const escapedSelectors = new Set<string>()
  const selectorName = options?.selectorName || options?.className || 'prose'
  const selectorNameRE = new RegExp(`^${selectorName}$`)
  const colorsRE = new RegExp(`^${selectorName}-([-\\w]+)$`)
  const invertRE = new RegExp(`^${selectorName}-invert$`)
  const disableNotUtility = options?.compatibility?.noColonNot || options?.compatibility?.noColonWhere

  return {
    name: '@unocss/preset-typography',
    enforce: 'post',
    layers: { typography: -20 },
    rules: [
      [
        selectorNameRE,
        (_, { rawSelector }) => {
          escapedSelectors.add(toEscapedSelector(rawSelector))
          return { 'color': 'var(--un-prose-body)', 'max-width': '65ch' }
        },
        { layer: 'typography' },
      ],
      [
        colorsRE,
        ([, color], { theme }) => {
          const baseColor = theme.colors?.[color] as Record<string, string> | string
          if (baseColor == null)
            return

          const colorObject = typeof baseColor === 'object' ? baseColor : {}
          return {
            '--un-prose-body': colorObject[700] ?? baseColor,
            '--un-prose-headings': colorObject[900] ?? baseColor,
            '--un-prose-links': colorObject[900] ?? baseColor,
            '--un-prose-lists': colorObject[400] ?? baseColor,
            '--un-prose-hr': colorObject[200] ?? baseColor,
            '--un-prose-captions': colorObject[500] ?? baseColor,
            '--un-prose-code': colorObject[900] ?? baseColor,
            '--un-prose-borders': colorObject[200] ?? baseColor,
            '--un-prose-bg-soft': colorObject[100] ?? baseColor,

            // invert colors (dark mode)
            '--un-prose-invert-body': colorObject[200] ?? baseColor,
            '--un-prose-invert-headings': colorObject[100] ?? baseColor,
            '--un-prose-invert-links': colorObject[100] ?? baseColor,
            '--un-prose-invert-lists': colorObject[500] ?? baseColor,
            '--un-prose-invert-hr': colorObject[700] ?? baseColor,
            '--un-prose-invert-captions': colorObject[400] ?? baseColor,
            '--un-prose-invert-code': colorObject[100] ?? baseColor,
            '--un-prose-invert-borders': colorObject[700] ?? baseColor,
            '--un-prose-invert-bg-soft': colorObject[800] ?? baseColor,
          }
        },
        { layer: 'typography' },
      ],
      [
        invertRE,
        () => {
          return {
            '--un-prose-body': 'var(--un-prose-invert-body)',
            '--un-prose-headings': 'var(--un-prose-invert-headings)',
            '--un-prose-links': 'var(--un-prose-invert-links)',
            '--un-prose-lists': 'var(--un-prose-invert-lists)',
            '--un-prose-hr': 'var(--un-prose-invert-hr)',
            '--un-prose-captions': 'var(--un-prose-invert-captions)',
            '--un-prose-code': 'var(--un-prose-invert-code)',
            '--un-prose-borders': 'var(--un-prose-invert-borders)',
            '--un-prose-bg-soft': 'var(--un-prose-invert-bg-soft)',
          }
        },
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
                    const notProseSelector = `:not(:where(.not-${selectorName},.not-${selectorName} *))`
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
      },
    ],
    preflights: [
      {
        layer: 'typography',
        getCSS: (context) => {
          if (escapedSelectors.size > 0) {
            return getPreflights(context, { escapedSelectors, ...options, selectorName })
          }
        },
      },
    ],
  }
})

export default presetTypography
