import { resolve } from 'path'
import { UserConfig } from '@unocss/core'
import { createConfigLoader as createLoader, LoadConfigResult } from 'unconfig'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'

export { LoadConfigResult }

export function createConfigLoader<U extends UserConfig>(configOrPath: string | U = process.cwd()): () => Promise<LoadConfigResult<U>> {
  let inlineConfig: U | undefined

  if (typeof configOrPath !== 'string') {
    inlineConfig = configOrPath
    if (inlineConfig.configFile === false) {
      return async() => ({
        config: inlineConfig as U,
        sources: [],
      })
    }
    else {
      configOrPath = inlineConfig.configFile || process.cwd()
    }
  }

  configOrPath = resolve(configOrPath)

  const loader = createLoader<U>({
    sources: [
      {
        files: [
          'unocss.config',
          'uno.config',
        ],
      },
      sourcePluginFactory({
        files: 'vite.config',
        targetModule: 'unocss/vite',
      }),
      sourceObjectFields({
        files: 'nuxt.config',
        fields: 'unocss',
      }),
    ],
    cwd: configOrPath,
    defaults: inlineConfig,
  })

  return async() => {
    const result = await loader.load()
    if (result.config.configDeps)
      result.sources = [...result.sources, ...result.config.configDeps]
    return result
  }
}

export function loadConfig<U extends UserConfig>(dirOrPath: string | U) {
  return createConfigLoader<U>(dirOrPath)()
}

declare module '@unocss/core' {
  interface ExtraConfig {
    /**
     * Load from configs files
     *
     * set `false` to disable
     */
    configFile?: string | false

    /**
     * List of files that will also triggers config reloads
     */
    configDeps?: string[]
  }
}
