import type { Preset, ResolvedConfig, Rule, Shortcut, ToArray, UserConfig, UserConfigDefaults, UserShortcuts } from './types'
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

const __RESOLVED = '_uno_resolved'

/**
 * Resolve a single preset, nested presets are ignored
 */
export function resolvePreset<Theme extends {} = {}>(preset: Preset<Theme>): Preset<Theme> {
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
export function resolvePresets<Theme extends {} = {}>(preset: Preset<Theme>): Preset<Theme>[] {
  const root = resolvePreset(preset)
  if (!root.presets)
    return [root]
  const nested = (root.presets || []).flatMap(toArray).flatMap(resolvePresets)
  return [root, ...nested]
}

export function resolveConfig<Theme extends {} = {}>(
  userConfig: UserConfig<Theme> = {},
  defaults: UserConfigDefaults<Theme> = {},
): ResolvedConfig<Theme> {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults<Theme>
  const rawPresets = uniq((config.presets || []).flatMap(toArray).flatMap(resolvePresets))

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

  function getMerged<T extends 'rules' | 'variants' | 'extractors' | 'shortcuts' | 'preflights' | 'preprocess' | 'postprocess' | 'extendTheme' | 'safelist' | 'separators'>(key: T): ToArray<Required<UserConfig<Theme>>[T]> {
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

  let theme: Theme = sources.map(p => p.theme ? clone(p.theme) : {})
    .reduce<Theme>((a, p) => mergeDeep(a, p), {} as Theme)

  const extendThemes = getMerged('extendTheme')
  for (const extendTheme of extendThemes)
    theme = extendTheme(theme) || theme

  const autocomplete = {
    templates: uniq(sources.flatMap(p => toArray(p.autocomplete?.templates))),
    extractors: sources.flatMap(p => toArray(p.autocomplete?.extractors))
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
  }

  let separators = getMerged('separators')
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
  }

  for (const p of sources)
    p?.configResolved?.(resolved)

  return resolved
}
