import { NanowindUserConfig, NanowindConfig } from './types'
import { extractorSplit } from './presets/default/extractors'
import { presetDefault, defaultTheme, uniq } from '.'

export function resolveConfig(config: NanowindUserConfig = {}): NanowindConfig {
  const presets = config.presets || [presetDefault]

  function mergePresets<T extends 'rules' | 'variants' | 'extractors'>(key: T): NanowindConfig[T] {
    return uniq([
      ...presets.flatMap(p => (p[key] || []) as any[]),
      ...(config[key] || []) as any[],
    ])
  }

  const extractors = mergePresets('extractors')
  if (!extractors.length)
    extractors.push(extractorSplit)

  return {
    theme: defaultTheme,
    ...config,
    rules: mergePresets('rules'),
    variants: mergePresets('variants'),
    extractors,
  }
}
