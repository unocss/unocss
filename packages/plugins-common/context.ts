import { createFilter } from '@rollup/pluginutils'
import type { LoadConfigResult, LoadConfigSource } from '@unocss/config'
import { createConfigLoader } from '@unocss/config'
import type { UnocssPluginContext, UserConfig, UserConfigDefaults } from '@unocss/core'
import { BetterMap, createGenerator } from '@unocss/core'
import { CSS_PLACEHOLDER, INCLUDE_COMMENT } from './constants'
import { defaultExclude, defaultInclude } from './defaults'

export function createContext<Config extends UserConfig = UserConfig>(
  configOrPath?: Config | string,
  defaults: UserConfigDefaults = {},
  extraConfigSources: LoadConfigSource[] = [],
  resolveConfigResult: (config: LoadConfigResult<Config>) => void = () => {},
): UnocssPluginContext<Config> {
  let root = process.cwd()
  const loadConfig = createConfigLoader(configOrPath || root, extraConfigSources)

  let rawConfig = {} as Config
  const uno = createGenerator(rawConfig, defaults)
  let rollupFilter = createFilter(defaultInclude, defaultExclude)

  const invalidations: Array<() => void> = []

  const modules = new BetterMap<string, string>()
  const tokens = new Set<string>()

  let ready = reloadConfig()

  async function reloadConfig() {
    const result = await loadConfig(configOrPath || root)
    resolveConfigResult(result)

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

  async function extract(code: string, id?: string) {
    if (id)
      modules.set(id, code)
    const len = tokens.size
    await uno.applyExtractors(code, id, tokens)
    if (tokens.size > len)
      invalidate()
  }

  const filter = (code: string, id: string) => {
    return code.includes(INCLUDE_COMMENT) || code.includes(CSS_PLACEHOLDER) || rollupFilter(id)
  }

  async function getConfig() {
    await ready
    return rawConfig
  }

  return {
    get ready() {
      return ready
    },
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
    root,
    updateRoot,
  }
}
