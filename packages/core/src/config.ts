import type { Preset, PresetFactory, ResolvedConfig, Rule, Shortcut, ToArray, UserConfig, UserConfigDefaults, UserShortcuts } from './types'
import { clone, isStaticRule, mergeDeep, normalizeVariant, toArray, uniq, uniqueBy } from './utils'
import { extractorSplit } from './extractors'
import { DEFAULT_LAYERS } from './constants'

export function resolveShortcuts<Theme extends object = object>(shortcuts: UserShortcuts<Theme>): Shortcut<Theme>[] {
  return toArray(shortcuts).flatMap((s) => {
    if (Array.isArray(s))
      return [s]
    return Object.entries(s)
  })
}

const __RESOLVED = '_uno_resolved'

/**
 * Resolve a single preset, nested presets are ignored
 */
export function resolvePreset<Theme extends object = object>(presetInput: Preset<Theme> | PresetFactory<Theme, any>): Preset<Theme> {
  let preset = typeof presetInput === 'function'
    ? presetInput()
    : presetInput

  if (__RESOLVED in preset)
    return preset

  preset = { ...preset }
  Object.defineProperty(preset, __RESOLVED, {
    value: true,
    enumerable: false,
  })

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

/**
 * Resolve presets with nested presets
 */
export function resolvePresets<Theme extends object = object>(preset: Preset<Theme> | PresetFactory<Theme, any>): Preset<Theme>[] {
  const root = resolvePreset(preset)
  if (!root.presets)
    return [root]
  const nested = (root.presets || []).flatMap(toArray).flatMap(resolvePresets)
  return [root, ...nested]
}

export function resolveConfig<Theme extends object = object>(
  userConfig: UserConfig<Theme> = {},
  defaults: UserConfigDefaults<Theme> = {},
): ResolvedConfig<Theme> {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults<Theme>
  const rawPresets = uniqueBy((config.presets || []).flatMap(toArray).flatMap(resolvePresets), (a, b) => a.name === b.name)

  const sortedPresets = [
    ...rawPresets.filter(p => p.enforce === 'pre'),
    ...rawPresets.filter(p => !p.enforce),
    ...rawPresets.filter(p => p.enforce === 'post'),
  ]

  const sources = [
    ...sortedPresets,
    config,
  ]
  const sourcesReversed = [...sources].reverse()

  const layers = Object.assign({}, DEFAULT_LAYERS, ...sources.map(i => i.layers))

  function getMerged<T extends 'rules' | 'blocklist' | 'variants' | 'extractors' | 'shortcuts' | 'preflights' | 'preprocess' | 'postprocess' | 'extendTheme' | 'safelist' | 'separators'>(key: T): ToArray<Required<UserConfig<Theme>>[T]> {
    return uniq(sources.flatMap(p => toArray(p[key] || []) as any[])) as any
  }

  const extractors = getMerged('extractors')
  let extractorDefault = sourcesReversed
    .find(i => i.extractorDefault !== undefined)?.extractorDefault
  if (extractorDefault === undefined)
    extractorDefault = extractorSplit
  if (extractorDefault && !extractors.includes(extractorDefault))
    extractors.unshift(extractorDefault)

  extractors.sort((a, b) => (a.order || 0) - (b.order || 0))

  const rules = getMerged('rules')
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

  let theme: Theme = mergeThemes(sources.map(p => p.theme))

  const extendThemes = getMerged('extendTheme')
  for (const extendTheme of extendThemes)
    theme = extendTheme(theme) || theme

  const autocomplete = {
    templates: uniq(sources.flatMap(p => toArray(p.autocomplete?.templates))),
    extractors: sources.flatMap(p => toArray(p.autocomplete?.extractors))
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    shorthands: mergeAutocompleteShorthands(sources.map(p => p.autocomplete?.shorthands || {})),
  }

  let separators = getMerged('separators')
  if (!separators.length)
    separators = [':', '-']

  const resolved: ResolvedConfig<any> = {
    mergeSelectors: true,
    warn: true,
    sortLayers: layers => layers,
    ...config,
    blocklist: getMerged('blocklist'),
    presets: sortedPresets,
    envMode: config.envMode || 'build',
    shortcutsLayer: config.shortcutsLayer || 'shortcuts',
    layers,
    theme,
    rulesSize,
    rulesDynamic,
    rulesStaticMap,
    preprocess: getMerged('preprocess'),
    postprocess: getMerged('postprocess'),
    preflights: getMerged('preflights'),
    autocomplete,
    variants: getMerged('variants')
      .map(normalizeVariant)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    shortcuts: resolveShortcuts(getMerged('shortcuts')).reverse(),
    extractors,
    safelist: getMerged('safelist'),
    separators,
    details: config.details ?? (config.envMode === 'dev'),
  }

  for (const p of sources)
    p?.configResolved?.(resolved)

  return resolved
}

/**
 * Merge multiple configs into one, later ones have higher priority
 */
export function mergeConfigs<Theme extends object = object>(
  configs: UserConfig<Theme>[],
): UserConfig<Theme> {
  const maybeArrays = ['shortcuts', 'preprocess', 'postprocess']
  const config = configs.map(config => Object.entries(config)
    .reduce<UserConfig<Theme>>((acc, [key, value]) => ({
      ...acc,
      [key]: maybeArrays.includes(key) ? toArray(value) : value,
    }), {}))
    .reduce<UserConfig<Theme>>(({ theme: themeA, ...a }, { theme: themeB, ...b }) => {
      const c = mergeDeep<UserConfig<Theme>>(a, b, true)

      if (themeA || themeB)
        c.theme = mergeThemes([themeA, themeB])

      return c
    }, {})

  return config
}

function mergeThemes<Theme extends object = object>(themes: (Theme | undefined)[]): Theme {
  return themes.map(theme => theme ? clone(theme) : {}).reduce<Theme>((a, b) => mergeDeep(a, b), {} as Theme)
}

function mergeAutocompleteShorthands(shorthands: Record<string, string | string[]>[]) {
  return shorthands.reduce<Record<string, string>>((a, b) => {
    const rs: Record<string, string> = {}
    for (const key in b) {
      const value = b[key]
      if (Array.isArray(value))
        rs[key] = `(${value.join('|')})`

      else
        rs[key] = value
    }
    return {
      ...a,
      ...rs,
    }
  }, {})
}

export function definePreset<Options extends object | undefined = undefined, Theme extends object = object>(preset: PresetFactory<Theme, Options>): PresetFactory<Theme, Options>
export function definePreset<Theme extends object = object>(preset: Preset<Theme>): Preset<Theme>
export function definePreset(preset: any) {
  return preset
}
