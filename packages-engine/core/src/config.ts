import type { ContentOptions, FilterPattern, Preset, PresetFactory, PresetFactoryAwaitable, PresetOrFactoryAwaitable, ResolvedConfig, Rule, Shortcut, ToArray, UserConfig, UserConfigDefaults, UserShortcuts } from './types'
import { DEFAULT_LAYERS } from './constants'
import { extractorSplit } from './extractors'
import { clone, isStaticRule, mergeDeep, normalizeVariant, toArray, uniq, uniqueBy } from './utils'

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
export async function resolvePreset<Theme extends object = object>(presetInput: PresetOrFactoryAwaitable<Theme>): Promise<Preset<Theme>> {
  let preset = typeof presetInput === 'function'
    ? await presetInput()
    : await presetInput

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
export async function resolvePresets<Theme extends object = object>(preset: PresetOrFactoryAwaitable<Theme>): Promise<Preset<Theme>[]> {
  const root = await resolvePreset(preset)
  if (!root.presets)
    return [root]
  const nested = (await Promise.all((root.presets || []).flatMap(toArray).flatMap(resolvePresets))).flat()
  return [root, ...nested]
}

// merge ContentOptions array
function mergeContentOptions(optionsArray: ContentOptions[]): ContentOptions {
  if (optionsArray.length === 0) {
    return {}
  }

  const pipelineIncludes: FilterPattern[] = []
  const pipelineExcludes: FilterPattern[] = []
  let pipelineDisabled = false
  const filesystem: ContentOptions['filesystem'][] = []
  const inline: ContentOptions['inline'][] = []

  for (const options of optionsArray) {
    if (options.pipeline === false) {
      pipelineDisabled = true
      break
    }
    else {
      if (options.pipeline?.include) {
        pipelineIncludes.push(options.pipeline.include)
      }
      if (options.pipeline?.exclude) {
        pipelineExcludes.push(options.pipeline.exclude)
      }
    }

    if (options.filesystem) {
      filesystem.push(options.filesystem)
    }
    if (options.inline) {
      inline.push(options.inline)
    }
  }

  const mergedContent: ContentOptions = {
    pipeline: pipelineDisabled
      ? false
      : {
          include: uniq(mergeFilterPatterns(...pipelineIncludes)),
          exclude: uniq(mergeFilterPatterns(...pipelineExcludes)),
        },
  }
  if (filesystem.length) {
    mergedContent.filesystem = uniq(filesystem.flat()) as ContentOptions['filesystem']
  }
  if (inline.length) {
    mergedContent.inline = uniq(inline.flat()) as ContentOptions['inline']
  }

  return mergedContent
}

export async function resolveConfig<Theme extends object = object>(
  userConfig: UserConfig<Theme> = {},
  defaults: UserConfigDefaults<Theme> = {},
): Promise<ResolvedConfig<Theme>> {
  const config = Object.assign({}, defaults, userConfig) as UserConfigDefaults<Theme>
  const rawPresets = uniqueBy(
    (await Promise.all((config.presets || []).flatMap(toArray).flatMap(resolvePresets))).flat(),
    (a, b) => a.name === b.name,
  )

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

  function getMerged<T extends 'rules' | 'blocklist' | 'variants' | 'extractors' | 'shortcuts' | 'preflights' | 'preprocess' | 'postprocess' | 'extendTheme' | 'safelist' | 'separators' | 'content' | 'transformers'>(key: T): ToArray<Required<UserConfig<Theme>>[T]> {
    return uniq(sources.flatMap(p => toArray(p[key] || []) as any[])) as any
  }

  const extractors = getMerged('extractors')
  let extractorDefault = sourcesReversed
    .find(i => i.extractorDefault !== undefined)
    ?.extractorDefault
  if (extractorDefault === undefined)
    extractorDefault = extractorSplit
  if (extractorDefault && !extractors.includes(extractorDefault))
    extractors.unshift(extractorDefault)

  extractors.sort((a, b) => (a.order || 0) - (b.order || 0))

  const rules = getMerged('rules')
  const rulesStaticMap: ResolvedConfig<Theme>['rulesStaticMap'] = {}

  const rulesSize = rules.length

  const rulesDynamic = rules
    .filter((rule) => {
      if (!isStaticRule(rule))
        return true
      // Put static rules into the map for faster lookup
      const prefixes = toArray(rule[2]?.prefix || '')
      prefixes.forEach((prefix) => {
        rulesStaticMap[prefix + rule[0]] = rule
      })
      return false
    })
    .reverse() as ResolvedConfig<Theme>['rulesDynamic']

  const autocomplete = {
    templates: uniq(sources.flatMap(p => toArray(p.autocomplete?.templates))),
    extractors: sources.flatMap(p => toArray(p.autocomplete?.extractors))
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    shorthands: mergeAutocompleteShorthands(sources.map(p => p.autocomplete?.shorthands || {})),
  }

  let separators = getMerged('separators')
  if (!separators.length)
    separators = [':', '-']

  const contents = getMerged('content')
  const content = mergeContentOptions(contents)

  const resolved: ResolvedConfig<Theme> = {
    mergeSelectors: true,
    warn: true,
    sortLayers: layers => layers,
    ...config,
    blocklist: getMerged('blocklist'),
    presets: sortedPresets,
    envMode: config.envMode || 'build',
    shortcutsLayer: config.shortcutsLayer || 'shortcuts',
    layers,
    theme: mergeThemes(sources.map(p => p.theme)),
    rules,
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
    content,
    transformers: uniqueBy(getMerged('transformers'), (a, b) => a.name === b.name),
  }

  const extendThemes = getMerged('extendTheme')
  for (const extendTheme of extendThemes)
    resolved.theme = extendTheme(resolved.theme, resolved) || resolved.theme

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
    .reduce<UserConfig<Theme>>(({ theme: themeA, content: contentA, ...a }, { theme: themeB, content: contentB, ...b }) => {
      const c = mergeDeep<UserConfig<Theme>>(a, b, true)

      if (themeA || themeB)
        c.theme = mergeThemes([themeA, themeB])

      if (contentA || contentB)
        c.content = mergeContentOptions([contentA || {}, contentB || {}])

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

function mergeFilterPatterns(...filterPatterns: FilterPattern[]): Array<string | RegExp> {
  return filterPatterns.flatMap(flatternFilterPattern)
}

function flatternFilterPattern(pattern?: FilterPattern): Array<string | RegExp> {
  return Array.isArray(pattern)
    ? pattern
    : pattern
      ? [pattern] as Array<string | RegExp>
      : []
}

export function definePreset<Options extends object | undefined = undefined, Theme extends object = object>(preset: PresetFactory<Theme, Options>): PresetFactory<Theme, Options>
export function definePreset<Options extends object | undefined = undefined, Theme extends object = object>(preset: PresetFactoryAwaitable<Theme, Options>): PresetFactoryAwaitable<Theme, Options>
export function definePreset<Theme extends object = object>(preset: Preset<Theme>): Preset<Theme>
export function definePreset(preset: any) {
  return preset
}
