import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import { type UnoGenerator, type UserConfig, type UserConfigDefaults, createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { loadConfig } from '@unocss/config'
import { transformClasses } from './transformClasses'
import { transformApply } from './transformApply'
import type { SvelteScopedContext, UnocssSveltePreprocessOptions } from './types'

// export * from './types.d.js'

export default function UnocssSveltePreprocess(options: UnocssSveltePreprocessOptions = {}, unoContextFromVite?: SvelteScopedContext): PreprocessorGroup {
  if (!options.classPrefix)
    options.classPrefix = 'spu-'

  let uno: UnoGenerator

  return {
    markup: async ({ content, filename }) => {
      if (!uno)
        uno = await getGenerator(options.configOrPath, unoContextFromVite)

      return await transformClasses({ content, filename: filename || '', uno, options })
    },

    style: async ({ content, attributes }) => {
      const addPreflights = !!attributes['unocss:preflights']
      const addSafelist = !!attributes['unocss:safelist']
      // TODO: if using Vite plugin warnOnce that they should add these globally instead of in a component - this is just for component libraries

      const checkForApply = options.applyVariables !== false

      const changeNeeded = addPreflights || addSafelist || checkForApply
      if (!changeNeeded)
        return

      if (!uno)
        uno = await getGenerator(options.configOrPath)

      let preflightsSafelistCss = ''
      if (addPreflights || addSafelist) {
        const { css } = await uno.generate([], { preflights: addPreflights, safelist: addSafelist, minify: true })
        preflightsSafelistCss = css
      }

      if (checkForApply) {
        const transformedApplies = await transformApply({
          code: content,
          uno,
          applyVariables: options.applyVariables,
        })

        if (transformedApplies)
          return { code: preflightsSafelistCss + transformedApplies }
      }

      if (preflightsSafelistCss)
        return { code: preflightsSafelistCss }
    },
  }
}

async function getGenerator(configOrPath?: UserConfig | string, unoContextFromVite?: SvelteScopedContext) {
  if (unoContextFromVite) {
    await unoContextFromVite.ready
    return unoContextFromVite.uno
  }

  const defaults: UserConfigDefaults = {
    presets: [
      presetUno(),
    ],
  }
  const { config } = await loadConfig(process.cwd(), configOrPath)
  return createGenerator(config, defaults)
}
