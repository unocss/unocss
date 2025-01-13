import type { UserConfig, UserConfigDefaults } from '@unocss/core'
import type { LoadConfigResult, LoadConfigSource } from 'unconfig'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { createConfigLoader as createLoader } from 'unconfig'

export type { LoadConfigResult, LoadConfigSource }

export async function loadConfig<U extends UserConfig>(
  cwd = process.cwd(),
  configOrPath: string | U = cwd,
  extraConfigSources: LoadConfigSource[] = [],
  defaults: UserConfigDefaults = {},
): Promise<LoadConfigResult<U>> {
  let inlineConfig = {} as U
  if (typeof configOrPath !== 'string') {
    inlineConfig = configOrPath
    if (inlineConfig.configFile === false) {
      return {
        config: inlineConfig as U,
        sources: [],
      }
    }
    else {
      configOrPath = inlineConfig.configFile || process.cwd()
    }
  }

  const resolved = resolve(configOrPath)

  let isFile = false
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    isFile = true
    cwd = dirname(resolved)
  }

  const loader = createLoader<U>({
    sources: isFile
      ? [
          {
            files: resolved,
            extensions: [],
          },
        ]
      : [
          {
            files: [
              'unocss.config',
              'uno.config',
            ],
          },
          ...extraConfigSources,
        ],
    cwd,
    defaults: inlineConfig,
  })

  const result = await loader.load()
  result.config = Object.assign(defaults, result.config || inlineConfig)
  if (result.config.configDeps) {
    result.sources = [
      ...result.sources,
      ...result.config.configDeps.map(i => resolve(cwd, i)),
    ]
  }

  return result
}

/**
 * Create a factory function that returns a config loader that recovers from errors.
 *
 * When it fails to load the config, it will return the last successfully loaded config.
 *
 * Mainly used for dev-time where users might have a broken config in between changes.
 */
export function createRecoveryConfigLoader<U extends UserConfig>() {
  let lastResolved: LoadConfigResult<U> | undefined
  return async (
    cwd = process.cwd(),
    configOrPath: string | U = cwd,
    extraConfigSources: LoadConfigSource[] = [],
    defaults: UserConfigDefaults = {},
  ) => {
    try {
      const config = await loadConfig(cwd, configOrPath, extraConfigSources, defaults)
      lastResolved = config
      return config
    }
    catch (e) {
      if (lastResolved) {
        console.error(e)
        return lastResolved
      }
      throw e
    }
  }
}
