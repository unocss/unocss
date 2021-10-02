import { MiniwindUserConfig, MiniwindConfig } from './types'
import { extractorSplit, presetDefault, defaultTheme } from './presets/default'
import { isStaticRule, uniq } from '.'

export function resolveConfig(config: MiniwindUserConfig = {}): MiniwindConfig {
  const presets = config.presets || [presetDefault()]

  function mergePresets<T extends 'rules' | 'variants' | 'extractors'>(key: T): Required<MiniwindUserConfig>[T] {
    return uniq([
      ...presets.flatMap(p => (p[key] || []) as any[]),
      ...(config[key] || []) as any[],
    ])
  }

  const extractors = mergePresets('extractors')
  if (!extractors.length)
    extractors.push(extractorSplit)

  const rules = mergePresets('rules')
  const staticRulesMap: MiniwindConfig['staticRulesMap'] = {}

  rules.forEach((rule, i) => {
    if (isStaticRule(rule)) {
      staticRulesMap[rule[0]] = [i, rule[1]]
      delete rules[i]
    }
  })

  return {
    theme: defaultTheme,
    ...config,
    dynamicRules: rules as MiniwindConfig['dynamicRules'],
    staticRulesMap,
    variants: mergePresets('variants'),
    extractors,
  }
}
