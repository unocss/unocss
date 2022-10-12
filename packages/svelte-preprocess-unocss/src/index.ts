import { type UnoGenerator, type UnocssPluginContext, type UserConfig, type UserConfigDefaults, createGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { transformSvelteSFC } from '@unocss/vite'
import presetUno from '@unocss/preset-uno'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import MagicString from 'magic-string'
// import type { SourceMap } from 'rollup'
// import remapping from '@ampproject/remapping'
// import type { EncodedSourceMap } from '@ampproject/remapping'

export default function SveltePreprocessUnocss(
  configOrPath?: UserConfig | string,
  defaults: UserConfigDefaults = {
    presets: [
      presetUno(),
    ],
  },
): PreprocessorGroup {
  let uno: UnoGenerator
  return {
    markup: async ({ content, filename }) => {
      if (!uno) {
        const { config } = await loadConfig(process.cwd(), configOrPath)
        uno = createGenerator(config, defaults)
      }

      let code = content
      // const maps: EncodedSourceMap[] = []

      const transformers = (uno.config.transformers || [])

      for (const t of transformers) {
        let s = new MagicString(content)
        const ctx = { uno } as UnocssPluginContext
        await t.transform(s, filename || '', ctx)
        if (s.hasChanged()) {
          code = s.toString()
          // maps.push(s.generateMap({ hires: true, source: filename }) as EncodedSourceMap)
          s = new MagicString(code)
        }
      }

      const result = await transformSvelteSFC(code, filename || '', uno)

      if (result?.code)
        code = result.code

      if (result?.map) {
        return {
          code,
          // map: result.map,
        }
      }
      else {
        return {
          code,
        }
      }

      // maps.push(result.map as EncodedSourceMap)
      // map: remapping(maps, () => null) as SourceMap,
    },
  }
}
