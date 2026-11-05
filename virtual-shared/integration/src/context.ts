import type { LoadConfigResult, LoadConfigSource } from '@unocss/config'
import type { FilterPattern, UnocssPluginContext, UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import process from 'node:process'
import { createRecoveryConfigLoader } from '@unocss/config'
import { BetterMap, createGenerator } from '@unocss/core'
import { createFilter } from 'unplugin-utils'
import { CSS_PLACEHOLDER, IGNORE_COMMENT, INCLUDE_COMMENT, SKIP_COMMENT_RE } from './constants'
import { defaultPipelineExclude, defaultPipelineInclude } from './defaults'
import { deprecationCheck } from './deprecation'

/** A pattern list that is absent or empty imposes no constraint. */
function isEmptyFilter(pattern: FilterPattern | undefined): boolean {
  return pattern == null || (Array.isArray(pattern) && pattern.length === 0)
}

/**
 * Create the filter for `pipeline.include` / `pipeline.exclude`.
 *
 * Patterns are resolved against every base — the build root and `process.cwd()` —
 * since they may be written relative to either (Nuxt reports `srcDir` as its root).
 * `include` matches when any base matches, `exclude` when any base excludes. An
 * empty list imposes no constraint, and virtual ids never match.
 */
export function createPipelineFilter(
  include: FilterPattern,
  exclude: FilterPattern,
  bases: string[],
): (id: unknown) => boolean {
  const uniqueBases = [...new Set(bases)]
  const includeFilters = isEmptyFilter(include) ? [] : uniqueBases.map(base => createFilter(include, [], { resolve: base }))
  const excludeFilters = isEmptyFilter(exclude) ? [] : uniqueBases.map(base => createFilter(exclude, [], { resolve: base }))

  return (id: unknown) => {
    // Virtual module ids never match, even when no pattern was given.
    if (typeof id !== 'string' || id.includes('\0'))
      return false
    return (!includeFilters.length || includeFilters.some(filter => filter(id)))
      && !(excludeFilters.length && excludeFilters.some(filter => filter(id)))
  }
}

export function createContext<Config extends UserConfig<any> = UserConfig<any>>(
  configOrPath?: Config | string,
  defaults: UserConfigDefaults = {},
  extraConfigSources: LoadConfigSource[] = [],
  resolveConfigResult: (config: LoadConfigResult<Config>) => void = () => { },
): UnocssPluginContext<Config> {
  let root = process.cwd()
  let rawConfig = {} as Config
  let configFileList: string[] = []
  let uno: UnoGenerator
  const _uno = createGenerator(rawConfig, defaults)
    .then((r) => {
      uno = r
      return r
    })
  let rollupFilter = createPipelineFilter(
    defaultPipelineInclude,
    defaultPipelineExclude,
    [root, process.cwd()],
  )

  const invalidations: Array<() => void> = []
  const reloadListeners: Array<() => void> = []

  const modules = new BetterMap<string, string>()
  const tokens = new Set<string>()
  const tasks: Promise<void>[] = []
  const affectedModules = new Set<string>()

  const loadConfig = createRecoveryConfigLoader<Config>()

  let ready = reloadConfig()

  async function reloadConfig() {
    await _uno
    const result = await loadConfig(root, configOrPath, extraConfigSources, defaults)
    resolveConfigResult(result)
    deprecationCheck(result.config)

    rawConfig = result.config
    configFileList = result.sources
    await uno.setConfig(rawConfig)
    rollupFilter = rawConfig.content?.pipeline === false
      ? () => false
      // An explicitly empty list is meaningful ("no constraint") and has to be
      // passed through; an absent or falsy non-pattern value falls back to the
      // defaults.
      : createPipelineFilter(
          rawConfig.content?.pipeline?.include || defaultPipelineInclude,
          rawConfig.content?.pipeline?.exclude || defaultPipelineExclude,
          [root, process.cwd()],
        )
    tokens.clear()
    await Promise.all(modules.map((code, id) => uno.applyExtractors(code.replace(SKIP_COMMENT_RE, ''), id, tokens)))
    invalidate()
    dispatchReload()

    return result
  }

  async function updateRoot(newRoot: string) {
    if (newRoot !== root) {
      root = newRoot
      ready = reloadConfig()
    }
    return await ready
  }

  function invalidate() {
    invalidations.forEach(cb => cb())
  }

  function dispatchReload() {
    reloadListeners.forEach(cb => cb())
  }

  async function extract(code: string, id?: string) {
    const uno = await _uno
    if (id)
      modules.set(id, code)
    const len = tokens.size
    await uno.applyExtractors(code.replace(SKIP_COMMENT_RE, ''), id, tokens)
    if (tokens.size > len)
      invalidate()
  }

  function filter(code: string, id: string) {
    if (code.includes(IGNORE_COMMENT))
      return false
    return code.includes(INCLUDE_COMMENT) || code.includes(CSS_PLACEHOLDER) || rollupFilter(id.replace(/\?v=\w+$/, ''))
  }

  async function getConfig() {
    await ready
    return rawConfig
  }

  async function flushTasks() {
    const _tasks = [...tasks]
    await Promise.all(_tasks)
    if (tasks[0] === _tasks[0])
      tasks.splice(0, _tasks.length)
  }

  /**
   * Get regexes to match virtual module ids
   */
  const vmpCache = new Map<string, { prefix: string, RESOLVED_ID_WITH_QUERY_RE: RegExp, RESOLVED_ID_RE: RegExp }>()
  async function getVMPRegexes(): Promise<{ prefix: string, RESOLVED_ID_WITH_QUERY_RE: RegExp, RESOLVED_ID_RE: RegExp }> {
    const config = await getConfig()
    const prefix = config.virtualModulePrefix || '__uno'

    if (vmpCache.has(prefix))
      return vmpCache.get(prefix)!

    const RESOLVED_ID_WITH_QUERY_RE = new RegExp(`[/\\\\]${prefix}(_.*?)?\\.css(\\?.*)?$`)
    const RESOLVED_ID_RE = new RegExp(`[/\\\\]${prefix}(?:_(.*?))?\.css$`)
    const regexes = {
      prefix,
      RESOLVED_ID_WITH_QUERY_RE,
      RESOLVED_ID_RE,
    }
    vmpCache.set(prefix, regexes)
    return regexes
  }

  return {
    get ready() {
      return ready
    },
    tokens,
    modules,
    affectedModules,
    tasks,
    flushTasks,
    invalidate,
    onInvalidate(fn: () => void) {
      invalidations.push(fn)
    },
    filter,
    reloadConfig,
    onReload(fn: () => void) {
      reloadListeners.push(fn)
    },
    get uno() {
      if (!uno)
        throw new Error('Run `await context.ready` before accessing `context.uno`')
      return uno
    },
    extract,
    getConfig,
    get root() {
      return root
    },
    updateRoot,
    getConfigFileList: () => configFileList,
    getVMPRegexes,
  }
}
