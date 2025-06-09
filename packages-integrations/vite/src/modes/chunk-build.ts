import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin, Rollup } from 'vite'

export function ChunkModeBuildPlugin(ctx: UnocssPluginContext): Plugin {
  let cssPlugin: Plugin | undefined

  const files: Record<string, string> = {}

  return {
    name: 'unocss:chunk',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) {
      cssPlugin = config.plugins.find(i => i.name === 'vite:css-post') as Plugin | undefined
    },
    async transform(code, id) {
      await ctx.ready
      if (!ctx.filter(code, id))
        return

      files[id] = code
      return null
    },
    async renderChunk(_, chunk) {
      const chunks = Object.keys(chunk.modules).map(i => files[i]).filter(Boolean)

      if (!chunks.length)
        return null

      await ctx.ready

      const tokens = new Set<string>()
      await Promise.all(chunks.map(c => ctx.uno.applyExtractors(c, undefined, tokens)))
      const { css } = await ctx.uno.generate(tokens)

      const cssPostTransformHandler = 'handler' in cssPlugin!.transform!
        ? cssPlugin!.transform.handler
        : cssPlugin!.transform!

      // fool the css plugin to generate the css in corresponding chunk
      const fakeCssId = `${chunk.fileName}.css`
      await cssPostTransformHandler.call(this as Rollup.TransformPluginContext, css, fakeCssId)
      chunk.modules[fakeCssId] = {
        code: null,
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore does not exist in rolldown
        originalLength: 0,
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore does not exist in rolldown
        removedExports: [],
        renderedExports: [],
        renderedLength: 0,
      }

      return null
    },
    async transformIndexHtml(code) {
      await ctx.ready
      const { css } = await ctx.uno.generate(code)

      if (css)
        return `${code}<style>${css}</style>`
    },
  }
}
