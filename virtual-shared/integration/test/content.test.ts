import type { UnocssPluginContext } from '@unocss/core'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import process from 'node:process'
import { describe, expect, it, vi } from 'vitest'
import { resolveFilesystemGlobs, setupContentExtractor } from '#integration/content'
import { createContext } from '#integration/context'
import { normalizeFilesystemGlob } from '#integration/glob'

describe('resolveFilesystemGlobs', () => {
  it('unions the globs of every base and dedupes the matches', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unocss-content-'))
    try {
      await mkdir(join(dir, 'app'), { recursive: true })
      await writeFile(join(dir, 'slides.md'), '# slides')
      await writeFile(join(dir, 'app', 'only-app.md'), '# app')

      // `app` stands in for a build tool root (Nuxt reports `srcDir`), `dir` for
      // the project root where the patterns are written relative to.
      const files = await resolveFilesystemGlobs(['**/*.md'], [join(dir, 'app'), dir, dir])

      expect(files.map(file => relative(dir, file).replace(/\\/g, '/')).sort())
        .toEqual(['app/only-app.md', 'slides.md'])
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('finds files relative to the project root when the build root is a sub directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unocss-root-'))
    const extracted: string[] = []
    // Pretend the project root is the temp directory, so the test does not
    // depend on which files happen to live in the real `process.cwd()`.
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(dir)

    try {
      await mkdir(join(dir, 'app'), { recursive: true })
      await writeFile(join(dir, 'project-root.md'), '# root')

      const ctx = {
        root: join(dir, 'app'),
        tasks: [],
        uno: { config: { transformers: [] } },
        getConfig: async () => ({ content: { filesystem: ['project-root.md'] } }),
        filter: () => true,
        extract: async (_code: string, id?: string) => {
          if (id)
            extracted.push(id)
        },
      } as unknown as UnocssPluginContext

      // The build root has no `project-root.md`; it is only reachable through
      // the project root, which is what Nuxt sets up with `srcDir`.
      await setupContentExtractor(ctx)
    }
    finally {
      cwd.mockRestore()
      await rm(dir, { recursive: true, force: true })
    }

    expect(extracted.map(file => relative(dir, file).replace(/\\/g, '/'))).toEqual(['project-root.md'])
  })

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

  it('dedupes matches from equivalent glob spellings', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unocss-globs-'))
    try {
      await mkdir(join(dir, 'content'), { recursive: true })
      await writeFile(join(dir, 'content', 'hero.md'), '# hero')

      const patterns = ['./content/**/*.md', './/content/**/*.md']
      if (process.platform === 'win32')
        patterns.push('content\\**\\*.md')

      const files = await resolveFilesystemGlobs(patterns, [dir])

      expect(files.map(file => relative(dir, file).replace(/\\/g, '/'))).toEqual(['content/hero.md'])
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('resolves literal `..` segments in globs', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unocss-glob-dotdot-'))
    try {
      await mkdir(join(dir, 'content'), { recursive: true })
      await mkdir(join(dir, 'shared'), { recursive: true })
      await writeFile(join(dir, 'shared', 'hero.md'), '# hero')

      const files = await resolveFilesystemGlobs(['content/../shared/**/*.md'], [dir])

      expect(files.map(file => relative(dir, file).replace(/\\/g, '/'))).toEqual(['shared/hero.md'])
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('normalizeFilesystemGlob', () => {
  it.runIf(process.platform !== 'win32')('keeps backslashes as escapes', () => {
    expect(normalizeFilesystemGlob('content\\**\\*.md')).toBe('content\\**\\*.md')
  })

  it.runIf(process.platform === 'win32')('converts Windows separators', () => {
    expect(normalizeFilesystemGlob('content\\**\\*.md')).toBe('content/**/*.md')
    expect(normalizeFilesystemGlob('//server/share/**/*.md')).toBe('//server/share/**/*.md')
  })
})
