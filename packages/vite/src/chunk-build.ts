import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { Context } from './context'
import { defaultExclude, defaultInclude } from './utils'

export function ChunkModeBuildPlugin({ uno, config }: Context): Plugin {
  let cssPlugin: Plugin | undefined

  const filter = createFilter(
    config.include || defaultInclude,
    config.exclude || defaultExclude,
  )

  const files: Record<string, string> = {}

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
      const chunks = Object.keys(chunk.modules).map(i => files[i]).filter(Boolean)

      if (!chunks.length)
        return null

      const tokens = new Set<string>()
      await Promise.all(chunks.map(c => uno.applyExtractors(c, undefined, tokens)))
      const { css } = await uno.generate(tokens)

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
    async transformIndexHtml(code) {
      const { css } = await uno.generate(code)

      if (css)
        return `${code}<style>${css}</style>`
    },
  }
}
