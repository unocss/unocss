import type { Postprocessor, Preprocessor, ResolvedConfig, Shortcut, ThemeExtender, UserConfig, UserConfigDefaults, UserShortcuts } from './types'
import { clone, isStaticRule, mergeDeep, normalizeVariant, toArray, uniq } from './utils'
import { extractorSplit } from './extractors'

export function resolveShortcuts(shortcuts: UserShortcuts): Shortcut[] {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s))
      return [s]
    return Object.entries(s)
  })
}

const defaultLayers = {
  preflights: -100,
  shortcuts: -1,
  default: 0,
}

export function resolveConfig(
  userConfig: UserConfig = {},
  defaults: UserConfigDefaults = {},
): ResolvedConfig {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults
  const rawPresets = (config.presets || []).flatMap(toArray)

  const sortedPresets = [
    ...rawPresets.filter(p => p.enforce === 'pre'),
    ...rawPresets.filter(p => !p.enforce),
    ...rawPresets.filter(p => p.enforce === 'post'),
  ]

  const layers = Object.assign(defaultLayers, ...rawPresets.map(i => i.layers), userConfig.layers)

  function mergePresets<T extends 'rules' | 'variants' | 'extractors' | 'shortcuts' | 'preflights' | 'preprocess' | 'postprocess' | 'extendTheme' | 'safelist'>(key: T): Required<UserConfig>[T] {
    return uniq([
      ...sortedPresets.flatMap(p => toArray(p[key] || []) as any[]),
      ...toArray(config[key] || []) as any[],
    ])
  }

  const extractors = mergePresets('extractors')
  if (!extractors.length)
    extractors.push(extractorSplit)
  extractors.sort((a, b) => (a.order || 0) - (b.order || 0))

  const rules = mergePresets('rules')
  const rulesStaticMap: ResolvedConfig['rulesStaticMap'] = {}

  const rulesSize = rules.length

  rules.forEach((rule, i) => {
    if (isStaticRule(rule)) {
      rulesStaticMap[rule[0]] = [i, rule[1], rule[2], rule]
      // delete static rules so we can't skip them in matching
      // but keep the order
      delete rules[i]
    }
  })

  const theme = clone([
    ...sortedPresets.map(p => p.theme || {}),
    config.theme || {},
  ].reduce((a, p) => mergeDeep(a, p), {}))

  ;(mergePresets('extendTheme') as ThemeExtender<any>[]).forEach(extendTheme => extendTheme(theme))

  const autocomplete = {
    templates: uniq(sortedPresets.map(p => toArray(p.autocomplete?.templates)).flat()),
    extractors: sortedPresets.map(p => toArray(p.autocomplete?.extractors)).flat()
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
  }

  return {
    mergeSelectors: true,
    warn: true,
    blocklist: [],
    sortLayers: layers => layers,
    ...config,
    presets: sortedPresets,
    envMode: config.envMode || 'build',
    shortcutsLayer: config.shortcutsLayer || 'shortcuts',
    layers,
    theme,
    rulesSize,
    rulesDynamic: rules as ResolvedConfig['rulesDynamic'],
    rulesStaticMap,
    preprocess: mergePresets('preprocess') as Preprocessor[],
    postprocess: mergePresets('postprocess') as Postprocessor[],
    preflights: mergePresets('preflights'),
    autocomplete,
    variants: mergePresets('variants').map(normalizeVariant),
    shortcuts: resolveShortcuts(mergePresets('shortcuts')),
    extractors,
    safelist: mergePresets('safelist'),
  }
}
