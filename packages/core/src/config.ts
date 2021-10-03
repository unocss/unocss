import { UserShortcuts } from 'miniwind'
import { UserConfig, ResolvedConfig, UserConfigDefaults, Shortcut } from './types'
import { isStaticRule, toArray, uniq } from './utils'
import { extractorSplit } from './extractors'

export function resolveShortcuts(shortcuts: UserShortcuts): Shortcut[] {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s))
      return [s]
    return Object.entries(s)
  })
}

export function resolveConfig(defaults: UserConfigDefaults, userConfig: UserConfig = {}): ResolvedConfig {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults
  const presets = config.presets || []

  function mergePresets<T extends 'rules' | 'variants' | 'extractors' | 'shortcuts'>(key: T): Required<UserConfig>[T] {
    return uniq([
      ...presets.flatMap(p => toArray(p[key] || []) as any[]),
      ...toArray(config[key] || []) as any[],
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
    // TODO: support them
    mergeSelectors: true,
    warnExcluded: true,
    excluded: [],
    ...config,
    rulesSize,
    rulesDynamic: rules as ResolvedConfig['rulesDynamic'],
    rulesStaticMap,
    variants: mergePresets('variants'),
    shortcuts: resolveShortcuts(mergePresets('shortcuts')),
    extractors,
  }
}
