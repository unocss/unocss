import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import { type UnoGenerator, type UserConfig, type UserConfigDefaults, createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { loadConfig } from '@unocss/config'
// import { transformClasses } from './transformClasses'
import type { UnocssSveltePreprocessOptions } from './types'
import { transformApply } from './transformApply'

export default function UnocssSveltePreprocess(options: UnocssSveltePreprocessOptions = {}): PreprocessorGroup {
  if (!options.classPrefix)
    options.classPrefix = 'spu-'

  let uno: UnoGenerator

  return {
    markup: async ({ content, filename }) => {
      if (!uno)
        uno = await init(options.configOrPath)

      // return await transformClasses({ code: content, filename: filename || '', uno, options })
    },

    style: async ({ content }) => {
      if (options.applyVariables === false)
        return

      if (!uno)
        uno = await init(options.configOrPath)

      return await transformApply({
        code: content,
        uno,
        applyVariables: options.applyVariables,
      })
    },
  }
}

async function init(configOrPath?: UserConfig | string) {
  const defaults: UserConfigDefaults = {
    presets: [
      presetUno(),
    ],
  }
  const { config } = await loadConfig(process.cwd(), configOrPath)
  return createGenerator(config, defaults)
}
