import type { Postprocessor, Preflight, PreflightContext, PresetOptions } from '@unocss/core'
import { definePreset } from '@unocss/core'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import { preflights } from './preflights'
import { rules } from './rules'
import type { Theme, ThemeAnimation } from './theme'
import { theme } from './theme'
import { variants } from './variants'
import { shorthands } from './shorthands'

export { preflights } from './preflights'
export { theme, colors } from './theme'
export { parseColor } from './utils'

export type { ThemeAnimation, Theme }

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

export interface PresetMiniOptions extends PresetOptions {
  /**
   * Dark mode options
   *
   * @default 'class'
   */
  dark?: 'class' | 'media' | DarkModeSelectors
  /**
   * Generate pseudo selector as `[group=""]` instead of `.group`
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
   * Utils prefix
   *
   * @default undefined
   */
  prefix?: string | string[]
  /**
   * Generate preflight
   *
   * @default true
   */
  preflight?: boolean

  /**
   * Enable arbitrary variants, for example `<div class="[&>*]:m-1 [&[open]]:p-2"></div>`.
   *
   * Disable this might slightly improve the performance.
   *
   * @default true
   */
  arbitraryVariants?: boolean
}

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
    preflights: options.preflight
      ? normalizePreflights(preflights, options.variablePrefix)
      : [],
    extractorDefault: options.arbitraryVariants === false
      ? undefined
      : extractorArbitraryVariants,
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

export function normalizePreflights<Theme extends object>(preflights: Preflight<Theme>[], variablePrefix: string) {
  if (variablePrefix !== 'un-') {
    return preflights.map(p => ({
      ...p,
      getCSS: (() => async (ctx: PreflightContext<Theme>) => {
        const css = await p.getCSS(ctx)
        if (css)
          return css.replace(/--un-/g, `--${variablePrefix}`)
      })(),
    }))
  }

  return preflights
}
