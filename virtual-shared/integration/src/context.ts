import type { LoadConfigResult, LoadConfigSource } from '@unocss/config'
import type { UnocssPluginContext, UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import process from 'node:process'
import { createRecoveryConfigLoader } from '@unocss/config'
import { BetterMap, createGenerator } from '@unocss/core'
import { createFilter } from 'unplugin-utils'
import { CSS_PLACEHOLDER, IGNORE_COMMENT, INCLUDE_COMMENT, SKIP_COMMENT_RE } from './constants'
import { defaultPipelineExclude, defaultPipelineInclude } from './defaults'
import { deprecationCheck } from './deprecation'

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
    uno.config.envMode = 'dev'
    rollupFilter = rawConfig.content?.pipeline === false
      ? () => false
      : createFilter(
          rawConfig.content?.pipeline?.include || defaultPipelineInclude,
          rawConfig.content?.pipeline?.exclude || defaultPipelineExclude,
          { resolve: typeof configOrPath === 'string' ? configOrPath : root },
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
  }
}
