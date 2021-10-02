import { MiniwindUserConfig, MiniwindConfig } from './types'
import { extractorSplit, presetDefault, defaultTheme } from './presets/default'
import { uniq } from '.'

export function resolveConfig(config: MiniwindUserConfig = {}): MiniwindConfig {
  const presets = config.presets || [presetDefault()]

  function mergePresets<T extends 'rules' | 'variants' | 'extractors'>(key: T): MiniwindConfig[T] {
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
