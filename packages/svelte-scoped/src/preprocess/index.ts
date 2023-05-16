import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import { type UnoGenerator, type UserConfig, type UserConfigDefaults, createGenerator, warnOnce } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { loadConfig } from '@unocss/config'
import { transformClasses } from './transformClasses'
import { transformApply } from './transformApply'
import type { SvelteScopedContext, UnocssSveltePreprocessOptions } from './types'

export * from './types.d.js'

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

    style: async ({ content, attributes, filename }) => {
      const addPreflights = !!attributes['uno:preflights']
      const addSafelist = !!attributes['uno:safelist']

      const checkForApply = options.applyVariables !== false

      const changeNeeded = addPreflights || addSafelist || checkForApply
      if (!changeNeeded)
        return

      if (!uno)
        uno = await getGenerator(options.configOrPath)

      let preflightsSafelistCss = ''
      if (addPreflights || addSafelist) {
        if (unoContextFromVite)
          warnOnce('Do not place preflights or safelist within an individual component as they already placed in your global styles injected into the head tag. These options are only for component libraries.')
        const { css } = await uno.generate([], { preflights: addPreflights, safelist: addSafelist, minify: true })
        preflightsSafelistCss = css
      }

      if (checkForApply) {
        return await transformApply({
          content,
          prepend: preflightsSafelistCss,
          uno,
          applyVariables: options.applyVariables,
          filename,
        })
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
