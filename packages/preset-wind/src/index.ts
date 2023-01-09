import type { Preset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { VarPrefixPostprocessor, preflights } from '@unocss/preset-mini'
import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { theme } from './theme'
import { variants } from './variants'

export { colors, preflights } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export { rules, shortcuts, theme, variants }

export interface PresetWindOptions extends PresetMiniOptions { }

export const presetWind = (options: PresetWindOptions = {}): Preset<Theme> => {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.preflight = options.preflight ?? true

  return {
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts,
    variants: variants(options),
    options,
    postprocess: options.variablePrefix && options.variablePrefix !== 'un-'
      ? VarPrefixPostprocessor(options.variablePrefix)
      : undefined,
    preflights: options.preflight ? preflights : [],
    prefix: options.prefix,
  }
}

export default presetWind
