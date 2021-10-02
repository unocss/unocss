import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { ResolvedPluginContext } from './types'
import { defaultExclude, defaultInclude } from './utils'

export function GlobalScopeBuildPlugin({ config, options, generate }: ResolvedPluginContext): Plugin {
  let cssPlugin: Plugin | undefined

  const filter = createFilter(
    options.include || defaultInclude,
    options.exclude || defaultExclude,
  )

  const files: Record<string, string> = {}

  return {
    name: 'miniwind:global:build',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      cssPlugin = config.plugins.find(i => i.name === 'vite:css-post')
    },
    transform(code, id) {
      if (id.endsWith('.css') || !filter(id))
        return

      files[id] = code
      return null
    },
    async renderChunk(code, chunk) {
      const chunks = Object.keys(chunk.modules).map(i => files[i]).filter(Boolean)

      if (!chunks.length)
        return null

      const result = await Promise.all(chunks.flatMap(code => config.extractors.map(i => i(code))))
      const { css } = await generate(result)

      // fool the css plugin to generate the css in corresponding chunk
      const fakeCssId = `${chunk.fileName}.css`
      // @ts-ignore
      await cssPlugin!.transform(css, fakeCssId)
      chunk.modules[fakeCssId] = {
        code: null,
        originalLength: 0,
        removedExports: [],
        renderedExports: [],
        renderedLength: 0,
      }

      return null
    },
  }
}
