import type { Postprocessor, Preflight, PreflightContext, Preset, PresetOptions } from '@unocss/core'
import { preflights } from './preflights'
import { rules } from './rules'
import type { Theme, ThemeAnimation } from './theme'
import { theme } from './theme'
import { variants } from './variants'

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
   * Generate psuedo selector as `[group=""]` instead of `.group`
   *
   * @default false
   */
  attributifyPseudo?: Boolean
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
}

export const presetMini = (options: PresetMiniOptions = {}): Preset<Theme> => {
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
    postprocess: VarPrefixPostprocessor(options.variablePrefix),
    preflights: options.preflight ? normalizePreflights(preflights, options.variablePrefix) : [],
    prefix: options.prefix,
  }
}

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

export function normalizePreflights(preflights: Preflight[], variablePrefix: string) {
  if (variablePrefix !== 'un-') {
    return preflights.map(p => ({
      ...p,
      getCSS: (() => async (ctx: PreflightContext) => {
        const css = await p.getCSS(ctx)
        if (css)
          return css.replace(/--un-/g, `--${variablePrefix}`)
      })(),
    }))
  }

  return preflights
}
