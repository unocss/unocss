import { dirname, resolve } from 'path'
import fs from 'fs'
import type { UserConfig } from '@unocss/core'
import type { LoadConfigResult, LoadConfigSource } from 'unconfig'
import { createConfigLoader as createLoader } from 'unconfig'

export type { LoadConfigResult, LoadConfigSource }

export function createConfigLoader<U extends UserConfig>(_configOrPath: string | U, extraConfigSources: LoadConfigSource[] = []) {
  let inlineConfig = {} as U

  return async(configOrPath = _configOrPath): Promise<LoadConfigResult<U>> => {
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
    let cwd = resolved

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
    result.config = result.config || inlineConfig
    if (result.config.configDeps) {
      result.sources = [
        ...result.sources,
        ...result.config.configDeps.map(i => resolve(cwd, i)),
      ]
    }

    return result
  }
}

export function loadConfig<U extends UserConfig>(dirOrPath: string | U) {
  return createConfigLoader<U>(dirOrPath)()
}
