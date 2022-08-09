import type { Postprocessor, Preprocessor, Preset, ResolvedConfig, Rule, Shortcut, ThemeExtender, UserConfig, UserConfigDefaults, UserShortcuts } from './types'
import { clone, isStaticRule, mergeDeep, normalizeVariant, toArray, uniq } from './utils'
import { extractorSplit } from './extractors'
import { DEAFULT_LAYERS } from './constants'

export function resolveShortcuts<T>(shortcuts: UserShortcuts<T>): Shortcut<T>[] {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s))
      return [s]
    return Object.entries(s)
  })
}

export function resolvePreset<T extends { shortcuts?: UserShortcuts<T> }>(preset: Preset<T>): Preset<T> {
  const shortcuts = preset.shortcuts
    ? resolveShortcuts(preset.shortcuts)
    : undefined
  preset.shortcuts = shortcuts

  if (preset.prefix || preset.layer) {
    const apply = (i: Rule<T> | Shortcut<T>) => {
      if (!i[2])
        i[2] = {}
      const meta = i[2]
      if (meta.prefix == null && preset.prefix)
        meta.prefix = preset.prefix
      if (meta.layer == null && preset.layer)
        meta.prefix = preset.layer
    }
    shortcuts?.forEach(apply)
    preset.rules?.forEach(apply)
  }

  return preset
}

export function resolveConfig<T>(
  userConfig: UserConfig<T> = {},
  defaults: UserConfigDefaults<T> = {},
): ResolvedConfig<T> {
  const config: UserConfigDefaults<T> = Object.assign({}, defaults, userConfig)
  const rawPresets = (config.presets || []).flatMap(toArray).map(resolvePreset)

  const sortedPresets = [
    ...rawPresets.filter(p => p.enforce === 'pre'),
    ...rawPresets.filter(p => !p.enforce),
    ...rawPresets.filter(p => p.enforce === 'post'),
  ]

  const layers = Object.assign(DEAFULT_LAYERS, ...rawPresets.map(i => i.layers), userConfig.layers)

  function mergePresets<Theme, T extends 'rules' | 'variants' | 'extractors' | 'shortcuts' | 'preflights' | 'preprocess' | 'postprocess' | 'extendTheme' | 'safelist'>(key: T): Required<UserConfig<Theme>>[T] {
    return uniq([
      ...sortedPresets.flatMap(p => toArray(p[key] || []) as any[]),
      ...toArray(config[key] || []) as any[],
    ])
  }

  const extractors = mergePresets('extractors')
  if (!extractors.length)
    extractors.push(extractorSplit)
  extractors.sort((a, b) => (a.order || 0) - (b.order || 0))

  const rules = mergePresets<T, 'rules'>('rules')
  const rulesStaticMap: ResolvedConfig<T>['rulesStaticMap'] = {}

  const rulesSize = rules.length

  rules.forEach((rule, i) => {
    if (isStaticRule(rule)) {
      const prefix = rule[2]?.prefix || ''
      rulesStaticMap[prefix + rule[0]] = [i, rule[1], rule[2], rule]
      // delete static rules so we can't skip them in matching
      // but keep the order
      delete rules[i]
    }
  })

  // HACK What if theme is not an object?
  const theme = clone<T>([
    ...sortedPresets.map(p => p.theme || {} as T),
    config.theme || {} as T,
  ].reduce<T>((a, p) => mergeDeep<T>(a, p), {} as T))

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
    rulesDynamic: rules as ResolvedConfig<T>['rulesDynamic'],
    rulesStaticMap,
    preprocess: mergePresets('preprocess') as Preprocessor[],
    postprocess: mergePresets('postprocess') as Postprocessor[],
    preflights: mergePresets<T, 'preflights'>('preflights'),
    autocomplete,
    variants: mergePresets<T, 'variants'>('variants').map(normalizeVariant),
    shortcuts: resolveShortcuts(mergePresets<T, 'shortcuts'>('shortcuts')),
    extractors,
    safelist: mergePresets('safelist'),
  }
}
