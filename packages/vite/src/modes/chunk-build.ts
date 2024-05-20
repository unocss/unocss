import type { Plugin } from 'vite'
import type { UnocssPluginContext } from '@unocss/core'

export function ChunkModeBuildPlugin({ uno, filter }: UnocssPluginContext): Plugin {
  let cssPlugin: Plugin | undefined

  const files: Record<string, string> = {}

  return {
    name: 'unocss:chunk',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      cssPlugin = config.plugins.find(i => i.name === 'vite:css-post') as Plugin | undefined
    },
    transform(code, id) {
      if (!filter(code, id))
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
      // @ts-expect-error no this context
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
