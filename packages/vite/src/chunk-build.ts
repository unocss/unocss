import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { mergeSet, UnoGenerator } from 'unocss'
import { defaultExclude, defaultInclude } from './utils'
import { UnocssUserOptions } from '.'

export function ChunkModeBuildPlugin(uno: UnoGenerator, options: UnocssUserOptions): Plugin {
  let cssPlugin: Plugin | undefined

  const filter = createFilter(
    options.include || defaultInclude,
    options.exclude || defaultExclude,
  )

  const files: Record<string, string> = {}
  const html: string[] = []

  return {
    name: 'unocss:chunk',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      cssPlugin = config.plugins.find(i => i.name === 'vite:css-post')
    },
    transform(code, id) {
      if (!filter(id))
        return

      files[id] = code
      return null
    },
    async renderChunk(_, chunk) {
      const chunks = [
        ...Object.keys(chunk.modules).map(i => files[i]).filter(Boolean),
        ...html,
      ]

      if (!chunks.length)
        return null

      const result = (await Promise.all(chunks.map(c => uno.applyExtractors(c)))).reduce(mergeSet, new Set())
      const { css } = await uno.generate(result)

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
    transformIndexHtml(code) {
      html.push(code)
    },
  }
}
