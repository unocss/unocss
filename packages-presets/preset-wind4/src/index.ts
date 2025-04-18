import type { Arrayable, BaseContext, CSSEntry, PresetOptions } from '@unocss/core'
import type { Theme } from './theme'
import { definePreset } from '@unocss/core'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import { postprocessors } from './postprocess'
import { preflights } from './preflights'
import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { shorthands } from './shorthands'
import { theme } from './theme'
import { PRESET_NAME, trackedTheme } from './utils'
import { variants } from './variants'

export { postprocessors, preflights, rules, shortcuts, shorthands, theme, variants }

export type { Theme }

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
   * Enable arbitrary variants, for example `<div class="[&>*]:m-1 [&[open]]:p-2"></div>`.
   *
   * Disable this might slightly improve the performance.
   *
   * @default true
   */
  arbitraryVariants?: boolean

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

  /**
   * Reset the default preflight styles.
   *
   * @default true
   */
  reset?: boolean

  /**
   * Generate theme keys as CSS variables.
   *
   * - `true`: Generate theme keys fully.
   * - `false`: Disable theme keys. (Not recommended ⚠️)
   * - `'on-demand'`: Generate theme keys only when used.
   *
   * @default 'on-demand'
   */
  themePreflight?: boolean | 'on-demand'

  /**
   * Resolve the layer utilits with custom logic.
   *
   * @param utility [key, value] {@link CSSEntry}
   * @param layer Layer name
   * @param ctx base generator context {@link BaseContext<Theme>}
   * @returns
   */
  utilityResolver?: Arrayable<(utility: CSSEntry, layer: string, ctx: BaseContext<Theme>) => void>
}

export const presetWind4 = definePreset<PresetWind4Options, Theme>((options = {}) => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.variablePrefix = options.variablePrefix ?? 'un-'
  options.important = options.important ?? false
  options.themePreflight = options.themePreflight ?? 'on-demand'

  return {
    name: PRESET_NAME,
    rules,
    shortcuts,
    theme,
    layers: {
      'cssvar-property': -200,
      'theme': -150,
    },
    preflights: preflights(options),
    variants: variants(options),
    prefix: options.prefix,
    postprocess: postprocessors(options),
    extractorDefault: options.arbitraryVariants === false
      ? undefined
      : extractorArbitraryVariants(),
    autocomplete: {
      shorthands,
    },
    options,
    meta: {
      themeDeps: trackedTheme,
    },
    configResolved() {
      trackedTheme.clear()
    },
  }
})

export default presetWind4
