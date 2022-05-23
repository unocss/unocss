import type { CSSObject, Preset, RuleContext } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { toEscapedSelector } from '@unocss/core'
import { getPreflights } from './preflights'

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
   * @defaultValue `prose`
   */
  selectorName?: string

  /**
   * Extend or override CSS selectors with CSS declaration block.
   *
   * @defaultValue undefined
   */
  cssExtend?: Record<string, CSSObject>
  /**
   * @deprecated use `selectorName` instead. It will be removed in 1.0.
   */
  className?: string
}

/**
 * UnoCSS Preset for Typography
 *
 * ```js
 * // unocss.config.js
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
 * @returns typography preset
 * @public
 */
export function presetTypography(options?: TypographyOptions): Preset {
  if (options?.className) {
    console.warn('[unocss:preset-typography] "className" is deprecated. '
    + 'Use "selectorName" instead.')
  }
  let hasProseClass = false
  let escapedSelector = ''
  const selectorName = options?.selectorName || options?.className || 'prose'
  const selectorNameRE = new RegExp(`^${selectorName}$`)
  const colorsRE = new RegExp(`^${selectorName}-([-\\w]+)$`)
  const invertRE = new RegExp(`^${selectorName}-invert$`)
  const cssExtend = options?.cssExtend

  return {
    name: '@unocss/preset-typography',
    enforce: 'post',
    layers: { typography: -1 },
    rules: [
      [
        selectorNameRE,
        (_, { rawSelector }) => {
          hasProseClass = true
          escapedSelector = toEscapedSelector(rawSelector)
          return { 'color': 'var(--un-prose-body)', 'max-width': '65ch' }
        },
        { layer: 'typography' },
      ],
      [
        colorsRE,
        ([, color], { theme }: RuleContext<Theme>) => {
          const baseColor = theme.colors?.[color]
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
    preflights: [
      {
        layer: 'typography',
        getCSS: () =>
          hasProseClass
            ? getPreflights(escapedSelector, selectorName, cssExtend)
            : undefined,
      },
    ],
  }
}

export default presetTypography
