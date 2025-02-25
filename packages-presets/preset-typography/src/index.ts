import type { CSSObject, Preset } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import type { TypographyCompatibilityOptions } from './types/compatibilityOptions'
import { definePreset, toEscapedSelector } from '@unocss/core'
import { alphaPlaceholders } from '@unocss/rule-utils'
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
          const TagColorMap = {
            'body': 700,
            'headings': 900,
            'links': 900,
            'lists': 400,
            'hr': 200,
            'captions': 500,
            'code': 900,
            'borders': 200,
            'bg-soft': 100,
            // invert colors (dark mode)
            'invert-body': 200,
            'invert-headings': 100,
            'invert-links': 100,
            'invert-lists': 500,
            'invert-hr': 700,
            'invert-captions': 400,
            'invert-code': 100,
            'invert-borders': 700,
            'invert-bg-soft': 800,
          }

          const result: any = {}

          for (const key in TagColorMap) {
            const value = TagColorMap[key as keyof typeof TagColorMap]
            const color = colorObject[value] ?? baseColor
            let hasAlpha = false

            for (const placeholder of alphaPlaceholders) {
              if (color.includes(placeholder)) {
                hasAlpha = true
                result[`--un-prose-${key}-opacity`] = 1
                result[`--un-prose-${key}`] = color.replace(placeholder, `var(--un-prose-${key}-opacity)`)
                break
              }
            }

            if (!hasAlpha)
              result[`--un-prose-${key}`] = color
          }

          return result
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
