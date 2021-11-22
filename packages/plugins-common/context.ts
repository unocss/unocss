import { createFilter } from '@rollup/pluginutils'
import { loadConfig } from '@unocss/config'
import { BetterMap, createGenerator, UnoGenerator, UserConfigDefaults } from '@unocss/core'
import { INCLUDE_COMMENT } from './constants'
import { defaultExclude, defaultInclude } from './defaults'
import { PluginConfig } from './types'

export interface UnocssPluginContext<Config extends PluginConfig = PluginConfig> {
  uno: UnoGenerator
  config: Config
  tokens: Set<string>
  modules: BetterMap<string, string>
  filter: (code: string, id: string) => boolean
  reloadConfig: () => Promise<void>
  scan: (code: string, id?: string) => Promise<void>
  configFilepath?: string

  invalidate: () => void
  onInvalidate: (fn: () => void) => void
}

export function createContext<Config extends PluginConfig = PluginConfig>(
  configOrPath?: Config | string,
  defaults: UserConfigDefaults = {},
): UnocssPluginContext<Config> {
  const { config = {} as Config, filepath } = loadConfig<Config>(configOrPath)

  const uno = createGenerator(config, defaults)

  const invalidations: Array<() => void> = []

  const modules = new BetterMap<string, string>()
  const tokens = new Set<string>()
  let rollupFilter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  function invalidate() {
    invalidations.forEach(cb => cb())
  }

  async function scan(code: string, id?: string) {
    if (id)
      modules.set(id, code)
    await uno.applyExtractors(code, id, tokens)
    invalidate()
  }

  async function reloadConfig() {
    if (!filepath)
      return
    uno.setConfig(loadConfig(filepath).config)
    uno.config.envMode = 'dev'
    rollupFilter = createFilter(
      config.include || defaultInclude,
      config.exclude || defaultExclude,
    )
    tokens.clear()
    await Promise.all(modules.map((code, id) => uno.applyExtractors(code, id, tokens)))
    invalidate()
  }

  const filter = (code: string, id: string) => {
    return code.includes(INCLUDE_COMMENT) || rollupFilter(id)
  }

  return {
    tokens,
    modules,
    invalidate,
    onInvalidate(fn: () => void) {
      invalidations.push(fn)
    },
    filter,
    reloadConfig,
    uno,
    scan,
    config,
    configFilepath: filepath,
  }
}
