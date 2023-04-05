import type { Preset } from '@unocss/core'
import { extractorSplit } from '@unocss/core'
import type { PresetMiniOptions, Theme } from '@unocss/preset-mini'
import { VarPrefixPostprocessor, normalizePreflights, preflights } from '@unocss/preset-mini'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { theme } from './theme'
import { variants } from './variants'

export { colors, preflights } from '@unocss/preset-mini'

export type { Theme } from '@unocss/preset-mini'

export { rules, shortcuts, theme, variants }

export interface PresetWindOptions extends PresetMiniOptions { }

export function presetWind(options: PresetWindOptions = {}): Preset<Theme> {
  options.dark = options.dark ?? 'class'
  options.attributifyPseudo = options.attributifyPseudo ?? false
  options.preflight = options.preflight ?? true
  options.variablePrefix = options.variablePrefix ?? 'un-'

  return {
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts,
    variants: variants(options),
    options,
    prefix: options.prefix,
    postprocess: VarPrefixPostprocessor(options.variablePrefix),
    preflights: options.preflight
      ? normalizePreflights(preflights, options.variablePrefix)
      : [],
    configResolved(config) {
      if (config.extractors.includes(extractorSplit))
        config.extractors.splice(config.extractors.indexOf(extractorSplit), 1, extractorArbitraryVariants)
      else
        config.extractors.unshift(extractorArbitraryVariants)
    },
  }
}

export default presetWind
