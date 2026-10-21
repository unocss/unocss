import type { UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'

export function ChunkModeBuildPlugin(ctx: UnocssPluginContext): Plugin {
  const files: Record<string, string> = {}

  return {
    name: 'unocss:chunk',
    apply: 'build',
    enforce: 'pre',
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
      const { css } = await ctx.uno.generate(tokens, { minify: true })

      // Emit the CSS as an asset and register it on the chunk's metadata.
      // `chunk.modules` is a read-only getter under rolldown-vite (#4403), so we
      // must not mutate it. Vite injects `chunk.viteMetadata` before render hooks.
      const referenceId = this.emitFile({
        type: 'asset',
        name: `${chunk.name || 'unocss'}.css`,
        source: css,
      })
      chunk.viteMetadata!.importedCss.add(this.getFileName(referenceId))

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
