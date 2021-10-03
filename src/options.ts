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
  const rulesStaticMap: MiniwindConfig['rulesStaticMap'] = {}

  const rulesSize = rules.length

  rules.forEach((rule, i) => {
    if (isStaticRule(rule)) {
      rulesStaticMap[rule[0]] = [i, rule[1]]
      // delete static rules so we can't skip them in matching
      // but keep the order
      delete rules[i]
    }
  })

  return {
    theme: defaultTheme,
    ...config,
    rulesSize,
    rulesDynamic: rules as MiniwindConfig['rulesDynamic'],
    rulesStaticMap,
    variants: mergePresets('variants'),
    extractors,
  }
}
