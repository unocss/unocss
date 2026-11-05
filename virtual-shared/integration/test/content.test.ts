import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { setupContentExtractor } from '#integration/content'
import { createContext } from '#integration/context'

describe('setupContentExtractor', () => {
  it('skips filesystem content when the pipeline is disabled, except magic comments', async () => {
    const root = await mkdtemp(join(tmpdir(), 'unocss-pipeline-off-'))
    try {
      await writeFile(join(root, 'pipeline-off-plain.md'), '<div class="flex">plain</div>')
      await writeFile(join(root, 'pipeline-off-included.md'), '<!-- @unocss-include --><div class="grid">included</div>')

      const ctx = createContext({
        content: {
          pipeline: false,
          filesystem: ['pipeline-off-*.md'],
        },
      })
      await ctx.ready
      await ctx.updateRoot(root)
      await setupContentExtractor(ctx)

      // Files without a magic comment are gated by the pipeline filter;
      // `@unocss-include` stays an explicit opt-in.
      expect(ctx.tokens.has('flex')).toBe(false)
      expect(ctx.tokens.has('grid')).toBe(true)
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
