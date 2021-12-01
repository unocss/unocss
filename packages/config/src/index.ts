import { resolve } from 'path'
import { UserConfig } from '@unocss/core'
import { createConfigLoader as createLoader, LoadConfigResult } from 'unconfig'
import { sourceObjectFields, sourcePluginFactory } from 'unconfig/presets'

export { LoadConfigResult }

export function createConfigLoader<U extends UserConfig>(dirOrPath: string | U = process.cwd()): () => Promise<LoadConfigResult<U>> {
  if (typeof dirOrPath !== 'string') {
    return async() => ({
      config: dirOrPath as U,
      sources: [],
    })
  }

  dirOrPath = resolve(dirOrPath)

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
    cwd: dirOrPath,
  })

  return loader.load
}

export function loadConfig<U extends UserConfig>(dirOrPath: string | U) {
  return createConfigLoader<U>(dirOrPath)()
}
