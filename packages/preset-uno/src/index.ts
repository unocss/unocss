import type { Preset } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { rules, shortcuts, theme, variants } from '@unocss/preset-wind'
import { VarPrefixPostprocessor, normalizePreflights, preflights } from '@unocss/preset-mini'
import { variantColorMix } from './variants/mix'

export type { Theme }

export interface PresetUnoOptions extends PresetMiniOptions {}

export function presetUno(options: PresetUnoOptions = {}): Preset<Theme> {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.preflight = options.preflight ?? true
  options.variablePrefix = options.variablePrefix ?? 'un-'

  return {
    name: '@unocss/preset-uno',
    theme,
    rules,
    shortcuts,
    variants: [
      ...variants(options),
      variantColorMix(),
    ],
    options,
    postprocess: VarPrefixPostprocessor(options.variablePrefix),
    preflights: options.preflight ? normalizePreflights(preflights, options.variablePrefix) : [],
    prefix: options.prefix,
  }
}

export default presetUno
