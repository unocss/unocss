import type { Postprocessor, Preprocessor, Preset, ResolvedConfig, Rule, Shortcut, UserConfig, UserConfigDefaults, UserShortcuts } from './types'
import { clone, isStaticRule, mergeDeep, normalizeVariant, toArray, uniq } from './utils'
import { extractorSplit } from './extractors'
import { DEFAULT_LAYERS } from './constants'

export function resolveShortcuts<Theme extends {} = {}>(shortcuts: UserShortcuts<Theme>): Shortcut<Theme>[] {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s))
      return [s]
    return Object.entries(s)
  })
}

export function resolvePreset<Theme extends {} = {}>(preset: Preset<Theme>): Preset<Theme> {
  const shortcuts = preset.shortcuts
    ? resolveShortcuts(preset.shortcuts)
    : undefined
  preset.shortcuts = shortcuts as any

  if (preset.prefix || preset.layer) {
    const apply = (i: Rule<Theme> | Shortcut) => {
      if (!i[2])
        i[2] = {}
      const meta = i[2]
      if (meta.prefix == null && preset.prefix)
        meta.prefix = toArray(preset.prefix)
      if (meta.layer == null && preset.layer)
        meta.layer = preset.layer
    }
    shortcuts?.forEach(apply)
    preset.rules?.forEach(apply)
  }

  return preset
}

export function resolveConfig<Theme extends {} = {}>(
  userConfig: UserConfig<Theme> = {},
  defaults: UserConfigDefaults<Theme> = {},
): ResolvedConfig<Theme> {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults<Theme>
  const rawPresets = (config.presets || []).flatMap(toArray).map(resolvePreset)

  const sortedPresets = [
    ...rawPresets.filter(p => p.enforce === 'pre'),
    ...rawPresets.filter(p => !p.enforce),
    ...rawPresets.filter(p => p.enforce === 'post'),
  ]

  const layers = Object.assign({}, DEFAULT_LAYERS, ...rawPresets.map(i => i.layers), config.layers)

  function mergePresets<T extends 'rules' | 'variants' | 'extractors' | 'shortcuts' | 'preflights' | 'preprocess' | 'postprocess' | 'extendTheme' | 'safelist' | 'separators'>(key: T): Required<UserConfig<Theme>>[T] {
    return uniq([
      ...sortedPresets.flatMap(p => toArray(p[key] || []) as any[]),
      ...toArray(config[key] || []) as any[],
    ])
  }

  const extractors = mergePresets('extractors')
  let extractorDefault = [...sortedPresets, config].reverse().find(i => i.extractorDefault !== undefined)?.extractorDefault
  if (extractorDefault === undefined)
    extractorDefault = extractorSplit
  if (extractorDefault && !extractors.includes(extractorDefault))
    extractors.unshift(extractorDefault)

  extractors.sort((a, b) => (a.order || 0) - (b.order || 0))

  const rules = mergePresets('rules')
  const rulesStaticMap: ResolvedConfig<Theme>['rulesStaticMap'] = {}

  const rulesSize = rules.length

  const rulesDynamic = rules
    .map((rule, i) => {
      if (isStaticRule(rule)) {
        const prefixes = toArray(rule[2]?.prefix || '')
        prefixes.forEach((prefix) => {
          rulesStaticMap[prefix + rule[0]] = [i, rule[1], rule[2], rule]
        })
        // delete static rules so we can't skip them in matching
        // but keep the order
        return undefined
      }
      return [i, ...rule]
    })
    .filter(Boolean)
    .reverse() as ResolvedConfig<Theme>['rulesDynamic']

  let theme: Theme = clone([
    ...sortedPresets.map(p => p.theme || {}),
    config.theme || {},
  ].reduce<Theme>((a, p) => mergeDeep(a, p), {} as Theme))

  const extendThemes = toArray(mergePresets('extendTheme'))
  for (const extendTheme of extendThemes)
    theme = extendTheme(theme) || theme

  const autocomplete = {
    templates: uniq(sortedPresets.map(p => toArray(p.autocomplete?.templates)).flat()),
    extractors: sortedPresets.map(p => toArray(p.autocomplete?.extractors)).flat()
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
  }

  let separators = toArray(mergePresets('separators'))
  if (!separators.length)
    separators = [':', '-']

  const resolved: ResolvedConfig<any> = {
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
    rulesDynamic,
    rulesStaticMap,
    preprocess: mergePresets('preprocess') as Preprocessor[],
    postprocess: mergePresets('postprocess') as Postprocessor[],
    preflights: mergePresets('preflights'),
    autocomplete,
    variants: mergePresets('variants')
      .map(normalizeVariant)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    shortcuts: resolveShortcuts(mergePresets('shortcuts')).reverse(),
    extractors,
    safelist: mergePresets('safelist'),
    separators,
  }

  for (const p of sortedPresets)
    p?.configResolved?.(resolved)
  userConfig?.configResolved?.(resolved)

  return resolved
}
