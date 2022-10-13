import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import MagicString from 'magic-string'
import { type UnoGenerator, type UserConfig, type UserConfigDefaults, createGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import presetUno from '@unocss/preset-uno'
import { transformDirectives } from '@unocss/transformer-directives'
import { type TransformSFCOptions, transformSvelteSFC } from '../../../packages/vite/src/modes/svelte-scoped' // set to @unocss/vite once #1692 (https://github.com/unocss/unocss/pull/1692) is merged and new release published

export interface SveltePreprocessUnocssOptions extends TransformSFCOptions {
  /**
   * Run @unocss/transformer-directives on style blocks
   * @default true
   */
  transformDirectives?: boolean
}

export default function SveltePreprocessUnocss({
  configOrPath,
  options = {},
}: {
  configOrPath?: UserConfig | string
  options: SveltePreprocessUnocssOptions
}): PreprocessorGroup {
  if (!options.transformDirectives)
    options.transformDirectives = true

  let uno: UnoGenerator
  return {
    markup: async ({ content, filename }) => {
      if (!uno)
        uno = await init(configOrPath)

      let code = content

      const result = await transformSvelteSFC(code, filename || '', uno, options)

      if (result?.code)
        code = result.code

      if (result?.map) {
        return {
          code,
          map: result.map,
        }
      }
      else {
        return {
          code,
        }
      }
    },
    style: async ({ content }) => {
      if (options.transformDirectives) {
        if (!uno)
          uno = await init(configOrPath)

        const s = new MagicString(content)
        await transformDirectives(s, uno, {
          varStyle: '--at-',
        })
        if (s.hasChanged())
          return { code: s.toString() }
      }
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
