import type { Postprocessor, PresetOptions } from '@unocss/core'
import type { Theme } from './theme'
import { definePreset } from '@unocss/core'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import { preflights } from './preflights'
import { rules } from './rules/default'
import { shortcuts } from './shortcuts'
import { shorthands } from './shorthands'
import { theme } from './theme'
import { variants } from './variants/default'

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

export interface PresetUnoNextOptions extends PresetOptions {
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
}

export const presetUnoNext = definePreset<PresetUnoNextOptions, Theme>((options = {}) => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.preflight = options.preflight ?? true
  options.variablePrefix = options.variablePrefix ?? 'un-'

  return {
    name: '@unocss/preset-uno-next',
    rules,
    shortcuts,
    theme,
    preflights: preflights(options),
    variants: variants(options),
    options,
    prefix: options.prefix,
    postprocess: VarPrefixPostprocessor(options.variablePrefix),
    extractorDefault: options.arbitraryVariants === false
      ? undefined
      : extractorArbitraryVariants(),
    autocomplete: {
      shorthands,
    },
  }
})

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
