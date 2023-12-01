import process from 'node:process'
import { createFilter } from '@rollup/pluginutils'
import type { LoadConfigResult, LoadConfigSource } from '@unocss/config'
import { loadConfig } from '@unocss/config'
import type { UnocssPluginContext, UserConfig, UserConfigDefaults } from '@unocss/core'
import { BetterMap, createGenerator } from '@unocss/core'
import { CSS_PLACEHOLDER, IGNORE_COMMENT, INCLUDE_COMMENT, SKIP_COMMENT_RE } from './constants'
import { defaultPipelineExclude, defaultPipelineInclude } from './defaults'
import { deprecationCheck } from './deprecation'

export function createContext<Config extends UserConfig<any> = UserConfig<any>>(
  configOrPath?: Config | string,
  defaults: UserConfigDefaults = {},
  extraConfigSources: LoadConfigSource[] = [],
  resolveConfigResult: (config: LoadConfigResult<Config>) => void = () => {},
): UnocssPluginContext<Config> {
  let root = process.cwd()
  let rawConfig = {} as Config
  let configFileList: string[] = []
  const uno = createGenerator(rawConfig, defaults)
  let rollupFilter = createFilter(
    defaultPipelineInclude,
    defaultPipelineExclude,
    { resolve: typeof configOrPath === 'string' ? configOrPath : root },
  )

  const invalidations: Array<() => void> = []
  const reloadListeners: Array<() => void> = []

  const modules = new BetterMap<string, string>()
  const tokens = new Set<string>()
  const tasks: Promise<void>[] = []
  const affectedModules = new Set<string>()

  let ready = reloadConfig()

  async function reloadConfig() {
    const result = await loadConfig(root, configOrPath, extraConfigSources, defaults)
    resolveConfigResult(result)
    deprecationCheck(result.config)

    rawConfig = result.config
    configFileList = result.sources
    uno.setConfig(rawConfig)
    uno.config.envMode = 'dev'
    rollupFilter = rawConfig.content?.pipeline === false
      ? () => false
      : createFilter(
        rawConfig.content?.pipeline?.include || rawConfig.include || defaultPipelineInclude,
        rawConfig.content?.pipeline?.exclude || rawConfig.exclude || defaultPipelineExclude,
        { resolve: typeof configOrPath === 'string' ? configOrPath : root },
      )
    tokens.clear()
    await Promise.all(modules.map((code, id) => uno.applyExtractors(code.replace(SKIP_COMMENT_RE, ''), id, tokens)))
    invalidate()
    dispatchReload()

    // check preset duplication
    const presets = new Set<string>()
    uno.config.presets.forEach((i) => {
      if (!i.name)
        return
      if (presets.has(i.name))
        console.warn(`[unocss] duplication of preset ${i.name} found, there might be something wrong with your config.`)
      else
        presets.add(i.name)
    })

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
    tasks.splice(0, _tasks.length)
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
    uno,
    extract,
    getConfig,
    get root() {
      return root
    },
    updateRoot,
    getConfigFileList: () => configFileList,
  }
}
