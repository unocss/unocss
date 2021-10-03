import { UserConfig, ResolvedConfig } from './types'
import { extractorSplit, presetDefault, defaultTheme } from './presets/default'
import { isStaticRule, uniq } from '.'

export function resolveConfig(config: UserConfig = {}): ResolvedConfig {
  const presets = config.presets || [presetDefault()]

  function mergePresets<T extends 'rules' | 'variants' | 'extractors'>(key: T): Required<UserConfig>[T] {
    return uniq([
      ...presets.flatMap(p => (p[key] || []) as any[]),
      ...(config[key] || []) as any[],
    ])
  }

  const extractors = mergePresets('extractors')
  if (!extractors.length)
    extractors.push(extractorSplit)

  const rules = mergePresets('rules')
  const rulesStaticMap: ResolvedConfig['rulesStaticMap'] = {}

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
    rulesDynamic: rules as ResolvedConfig['rulesDynamic'],
    rulesStaticMap,
    variants: mergePresets('variants'),
    extractors,
  }
}
