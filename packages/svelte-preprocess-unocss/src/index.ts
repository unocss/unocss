import type { UserConfig, UserConfigDefaults } from '@unocss/core'
import { transformSvelteSFC } from '@unocss/vite'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess'
import MagicString from 'magic-string'
import type { SourceMap } from 'rollup'
import remapping from '@ampproject/remapping'
import type { EncodedSourceMap } from '@ampproject/remapping'
import { createContext } from '../../shared-integration/src/context'

export default function SveltePreprocessUnocss(
  configOrPath?: UserConfig | string,
  defaults: UserConfigDefaults = {},
): PreprocessorGroup {
  const ctx = createContext<UserConfig>(configOrPath as any, defaults)
  // console.log('inited ctx')
  return {
    markup: async ({ content, filename }) => {
      let code = content
      const maps: EncodedSourceMap[] = []

      const transformers = (ctx.uno.config.transformers || [])

      for (const t of transformers) {
        let s = new MagicString(content)
        await t.transform(s, filename || '', ctx)
        if (s.hasChanged()) {
          code = s.toString()
          maps.push(s.generateMap({ hires: true, source: filename }) as EncodedSourceMap)
          s = new MagicString(code)
        }
      }

      const result = await transformSvelteSFC(code, filename || '', ctx.uno)
      if (result) {
        code = result.code
        maps.push(result.map as EncodedSourceMap)
      }

      return {
        code,
        map: remapping(maps, () => null) as SourceMap,
      }
    },
  }
}
