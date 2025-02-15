import type { Postprocessor, PresetOptions } from '@unocss/core'
import type { Theme, ThemeAnimation } from './theme'
import { definePreset } from '@unocss/core'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import { preflights } from './preflights'
import { rules } from './rules'
import { shorthands } from './shorthands'
import { theme } from './theme'
import { variants } from './variants'

export { preflights } from './preflights'
export { colors, theme } from './theme'
export { parseColor } from './utils'

export type { Theme, ThemeAnimation }

export interface DarkModeSelectors {
  /**
   * Selectors for light variant.
   *
   * @default '.light'
   */
  light?: string | string[]

  /**
   * Selectors for dark variant.
   *
   * @default '.dark'
   */
  dark?: string | string[]
}

export interface PresetMiniOptions extends PresetOptions {
  /**
   * Dark mode options
   *
   * @default 'class'
   */
  dark?: 'class' | 'media' | DarkModeSelectors
  /**
   * Generate tagged pseudo selector as `[group=""]` instead of `.group`
   *
   * @default false
   */
  attributifyPseudo?: boolean
  /**
   * Prefix for CSS variables.
   *
   * @default 'un-'
   */
  variablePrefix?: string
  /**
   * Utils prefix. When using tagged pseudo selector, only the first truthy prefix will be used.
   *
   * @default undefined
   */
  prefix?: string | string[]
  /**
   * Generate preflight
   *
   * @default true
   */
  preflight?: boolean | 'on-demand'

  /**
   * Enable arbitrary variants, for example `<div class="[&>*]:m-1 [&[open]]:p-2"></div>`.
   *
   * Disable this might slightly improve the performance.
   *
   * @default true
   */
  arbitraryVariants?: boolean
}

/**
 * The basic preset for UnoCSS, with only the most essential utilities.
 *
 * @see https://unocss.dev/presets/mini
 */
export const presetMini = definePreset((options: PresetMiniOptions = {}) => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.preflight = options.preflight ?? true
  options.variablePrefix = options.variablePrefix ?? 'un-'
  return {
    name: '@unocss/preset-mini',
    theme,
    rules,
    variants: variants(options),
    options,
    prefix: options.prefix,
    postprocess: VarPrefixPostprocessor(options.variablePrefix),
    preflights: preflights(options),
    extractorDefault: options.arbitraryVariants === false
      ? undefined
      : extractorArbitraryVariants(),
    autocomplete: {
      shorthands,
    },
  }
})

export default presetMini

export function VarPrefixPostprocessor(prefix: string): Postprocessor | undefined {
  if (prefix !== 'un-') {
    return (obj) => {
      obj.entries.forEach((i) => {
        i[0] = i[0].replace(/^--un-/, `--${prefix}`)
        if (typeof i[1] === 'string')
          i[1] = i[1].replace(/var\(--un-/g, `var(--${prefix}`)
      })
    }
  }
}
