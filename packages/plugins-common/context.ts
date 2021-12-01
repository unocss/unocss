import { createFilter } from '@rollup/pluginutils'
import { createConfigLoader, LoadConfigResult, LoadConfigSource } from '@unocss/config'
import { BetterMap, createGenerator, UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import { INCLUDE_COMMENT } from './constants'
import { defaultExclude, defaultInclude } from './defaults'

export interface UnocssPluginContext<Config extends UserConfig = UserConfig> {
  ready: Promise<LoadConfigResult<Config>>
  uno: UnoGenerator
  tokens: Set<string>
  modules: BetterMap<string, string>
  filter: (code: string, id: string) => boolean
  extract: (code: string, id?: string) => Promise<void>

  reloadConfig: () => Promise<LoadConfigResult<Config>>
  getConfig: () => Promise<Config>

  invalidate: () => void
  onInvalidate: (fn: () => void) => void
}

export function createContext<Config extends UserConfig = UserConfig>(
  configOrPath?: Config | string,
  defaults: UserConfigDefaults = {},
  extraConfigSources: LoadConfigSource[] = [],
): UnocssPluginContext<Config> {
  const loadConfig = createConfigLoader(configOrPath, extraConfigSources)

  let rawConfig = {} as Config
  const uno = createGenerator(rawConfig, defaults)
  let rollupFilter = createFilter(defaultInclude, defaultExclude)

  const invalidations: Array<() => void> = []

  const modules = new BetterMap<string, string>()
  const tokens = new Set<string>()

  const ready = reloadConfig()

  async function reloadConfig() {
    const result = await loadConfig()

    rawConfig = result.config
    uno.setConfig(rawConfig)
    uno.config.envMode = 'dev'
    rollupFilter = createFilter(
      rawConfig.include || defaultInclude,
      rawConfig.exclude || defaultExclude,
    )
    tokens.clear()
    await Promise.all(modules.map((code, id) => uno.applyExtractors(code, id, tokens)))
    invalidate()

    return result
  }

  function invalidate() {
    invalidations.forEach(cb => cb())
  }

  async function extract(code: string, id?: string) {
    if (id)
      modules.set(id, code)
    const len = tokens.size
    await uno.applyExtractors(code, id, tokens)
    if (tokens.size > len)
      invalidate()
  }

  const filter = (code: string, id: string) => {
    return code.includes(INCLUDE_COMMENT) || rollupFilter(id)
  }

  async function getConfig() {
    await ready
    return rawConfig
  }

  return {
    ready,
    tokens,
    modules,
    invalidate,
    onInvalidate(fn: () => void) {
      invalidations.push(fn)
    },
    filter,
    reloadConfig,
    uno,
    extract,
    getConfig,
  }
}
