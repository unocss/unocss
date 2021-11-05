import { UserShortcuts, UserConfig, ResolvedConfig, UserConfigDefaults, Shortcut } from './types'
import { isStaticRule, mergeDeep, normalizeVariant, toArray, uniq } from './utils'
import { extractorSplit } from './extractors'

export function resolveShortcuts(shortcuts: UserShortcuts): Shortcut[] {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s))
      return [s]
    return Object.entries(s)
  })
}

const defaultLayers = {
  shortcuts: -1,
  default: 0,
}

export function resolveConfig(
  userConfig: UserConfig = {},
  defaults: UserConfigDefaults = {},
): ResolvedConfig {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults
  const rawPresets = config.presets || []

  const sortedPresets = [
    ...rawPresets.filter(p => p.enforce === 'pre'),
    ...rawPresets.filter(p => !p.enforce),
    ...rawPresets.filter(p => p.enforce === 'post'),
  ]

  const layers = Object.assign(defaultLayers, ...rawPresets.map(i => i.layers), userConfig.layers)

  function mergePresets<T extends 'rules' | 'variants' | 'extractors' | 'shortcuts' | 'preflights'>(key: T): Required<UserConfig>[T] {
    return uniq([
      ...sortedPresets.flatMap(p => toArray(p[key] || []) as any[]),
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
      rulesStaticMap[rule[0]] = [i, rule[1], rule[2]]
      // delete static rules so we can't skip them in matching
      // but keep the order
      delete rules[i]
    }
  })

  const theme = [
    ...sortedPresets.map(p => p.theme || {}),
    config.theme || {},
  ].reduce((a, p) => mergeDeep(a, p), {})

  return {
    mergeSelectors: true,
    warnExcluded: true,
    excluded: [],
    sortLayers: layers => layers,
    ...config,
    envMode: config.envMode || 'build',
    shortcutsLayer: config.shortcutsLayer || 'shortcuts',
    layers,
    theme,
    rulesSize,
    rulesDynamic: rules as ResolvedConfig['rulesDynamic'],
    rulesStaticMap,
    preflights: mergePresets('preflights'),
    variants: mergePresets('variants').map(normalizeVariant),
    shortcuts: resolveShortcuts(mergePresets('shortcuts')),
    extractors,
  }
}
