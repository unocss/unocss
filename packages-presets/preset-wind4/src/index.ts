import type { PresetOptions } from '@unocss/core'
import type { Theme } from './theme'
import { definePreset } from '@unocss/core'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'

import { postprocessors } from './postprocess'
import { preflights } from './preflights'
import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { shorthands } from './shorthands'
import { theme } from './theme'
import { variants } from './variants'

export { postprocessors, preflights, rules, shortcuts, shorthands, theme, variants }

export interface DarkModeSelectors {
  /**
   * Selector for light variant.
   *
   * @default '.light'
   */
  light?: string

  /**
   * Selector for dark variant.
   *
   * @default '.dark'
   */
  dark?: string
}

export interface PresetWind4Options extends PresetOptions {
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

  /**
   * Choose which theme keys to export as CSS variables.
   */
  themeKeys?: string[] | ((keys: string[]) => string[])

  /**
   * The important option lets you control whether UnoCSS’s utilities should be marked with `!important`.
   *
   * This can be really useful when using UnoCSS with existing CSS that has high specificity selectors.
   *
   * You can also set `important` to a selector like `#app` instead, which will generate `#app :is(.m-1) { ... }`
   *
   * Also check out the compatibility with [:is()](https://caniuse.com/?search=%3Ais())
   *
   * @default false
   */
  important?: boolean | string
}

export const PresetWind4 = definePreset<PresetWind4Options, Theme>((options = {}) => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.preflight = options.preflight ?? true
  options.variablePrefix = options.variablePrefix ?? 'un-'
  options.important = options.important ?? false

  return {
    name: '@unocss/preset-uno-next',
    rules,
    shortcuts,
    theme,
    preflights: preflights(options),
    variants: variants(options),
    options,
    prefix: options.prefix,
    postprocess: postprocessors(options),
    extractorDefault: options.arbitraryVariants === false
      ? undefined
      : extractorArbitraryVariants(),
    autocomplete: {
      shorthands,
    },
  }
})

export default PresetWind4
