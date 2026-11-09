import type { FilterPattern } from '@unocss/core'
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mergeConfigs } from '@unocss/core'
import { describe, expect, it, vi } from 'vitest'
import { createContext, createPipelineFilter } from '#integration/context'

describe('createContext', () => {
  it.each<{ name: string, include?: FilterPattern, filename: string }>([
    { name: 'default', filename: 'foo.vue' },
    { name: 'glob', include: ['src/**/*.ts'], filename: 'foo.ts' },
    { name: 'empty', include: [], filename: 'foo.ts' },
  ])('allows matching files with $name includes and empty excludes', async ({ include, filename }) => {
    const cwd = process.cwd()
    const ctx = createContext({
      configFile: false,
      content: {
        pipeline: { include, exclude: [] },
      },
    })

    await ctx.ready

    expect(ctx.filter('code', `${cwd}/src/${filename}`)).toBe(true)

    await ctx.updateRoot(`${cwd}/app`)

    expect(ctx.filter('code', `${cwd}/src/${filename}`)).toBe(true)
    expect(ctx.filter('code', `${cwd}/app/src/${filename}`)).toBe(true)
  })

  it('resolves pipeline.include patterns against the root and process.cwd()', async () => {
    const cwd = process.cwd()
    const ctx = createContext({
      content: {
        pipeline: {
          include: ['src/**/*.{js,ts}'],
        },
      },
    })

    await ctx.ready

    // Root starts as `process.cwd()`.
    expect(ctx.filter('code', `${cwd}/src/foo.ts`)).toBe(true)
    expect(ctx.filter('code', `${cwd}/other/foo.ts`)).toBe(false)

    // Simulate a build tool reporting a sub directory as its root, as Nuxt does
    // with `srcDir`. Patterns are still written relative to the project root.
    await ctx.updateRoot(`${cwd}/src`)

    expect(ctx.filter('code', `${cwd}/src/foo.ts`)).toBe(true)
    expect(ctx.filter('code', `${cwd}/other/foo.ts`)).toBe(false)
  })

  it('still honours pipeline.exclude after the root is updated', async () => {
    const cwd = process.cwd()
    const ctx = createContext({
      content: {
        pipeline: {
          include: ['src/**/*.ts'],
          exclude: ['src/**/*.spec.ts'],
        },
      },
    })

    await ctx.ready
    await ctx.updateRoot(`${cwd}/src`)

    expect(ctx.filter('code', `${cwd}/src/foo.ts`)).toBe(true)
    expect(ctx.filter('code', `${cwd}/src/foo.spec.ts`)).toBe(false)
    expect(ctx.filter('code', `${cwd}/src/src/foo.ts`)).toBe(true)
    expect(ctx.filter('code', `${cwd}/src/src/foo.spec.ts`)).toBe(false)
  })

  it('returns false for regular ids when pipeline is disabled', async () => {
    const cwd = process.cwd()
    const ctx = createContext({ content: { pipeline: false } })

    await ctx.ready
    await ctx.updateRoot(`${cwd}/src`)

    expect(ctx.filter('code', `${cwd}/src/foo.ts`)).toBe(false)
  })

  it('still honours magic comments when pipeline is disabled', async () => {
    const cwd = process.cwd()
    const ctx = createContext({ content: { pipeline: false } })

    await ctx.ready

    // The magic comments are explicit opt-ins, so they bypass `pipeline: false`.
    expect(ctx.filter('@unocss-include flex', `${cwd}/src/foo.vue`)).toBe(true)
    expect(ctx.filter('@unocss-ignore @unocss-include flex', `${cwd}/src/foo.vue`)).toBe(false)
    expect(ctx.filter('@unocss-placeholder', `${cwd}/src/foo.css`)).toBe(true)
  })

  it('omits undeclared pipeline patterns when merging configs', async () => {
    const cwd = process.cwd()
    const config = mergeConfigs([
      { content: { filesystem: ['slides.md'] } },
      { presets: [] },
    ])
    // Nothing declared a pipeline, so the keys stay absent and integrations use
    // their defaults. Emitting an empty pair here used to filter out every module.
    expect(config.content?.pipeline).toBeUndefined()

    const ctx = createContext(config)
    await ctx.ready

    expect(ctx.filter('flex justify-between', `${cwd}/slides.md`)).toBe(true)
    expect(ctx.filter('<div class="p-8">', `${cwd}/src/foo.vue`)).toBe(true)
    // The defaults still apply: `.ts` is not an include target and CSS is
    // excluded. Only the documented default extensions are scanned.
    expect(ctx.filter('const a = 1', `${cwd}/src/foo.ts`)).toBe(false)
    expect(ctx.filter('.a {}', `${cwd}/src/foo.css`)).toBe(false)
  })

  it('falls back to the default filter for each merged option independently', async () => {
    const cwd = process.cwd()

    const includeOnly = createContext(mergeConfigs([
      { content: { pipeline: { include: ['src/**/*.ts'] } } },
      { presets: [] },
    ]))
    await includeOnly.ready

    // The declared include wins; the undeclared exclude falls back to the
    // default CSS exclusion instead of becoming an empty list.
    expect(includeOnly.filter('const a = 1', `${cwd}/src/foo.ts`)).toBe(true)
    expect(includeOnly.filter('const a = 1', `${cwd}/src/foo.spec.ts`)).toBe(true)
    expect(includeOnly.filter('flex', `${cwd}/src/foo.vue`)).toBe(false)
    expect(includeOnly.filter('.a {}', `${cwd}/src/foo.css`)).toBe(false)

    const excludeOnly = createContext(mergeConfigs([
      { content: { pipeline: { exclude: ['src/**/*.vue'] } } },
      { presets: [] },
    ]))
    await excludeOnly.ready

    // The declared exclude wins; the undeclared include falls back to the
    // default extensions.
    expect(excludeOnly.filter('flex', `${cwd}/src/foo.vue`)).toBe(false)
    expect(excludeOnly.filter('flex', `${cwd}/src/foo.svelte`)).toBe(true)
    expect(excludeOnly.filter('const a = 1', `${cwd}/src/foo.ts`)).toBe(false)

    const emptyInclude = createContext(mergeConfigs([
      { content: { pipeline: { include: [] } } },
      { presets: [] },
    ]))
    await emptyInclude.ready

    // An empty include removes the include constraint; the default exclude
    // still applies.
    expect(emptyInclude.filter('flex', `${cwd}/src/foo.ts`)).toBe(true)
    expect(emptyInclude.filter('.a {}', `${cwd}/src/foo.css`)).toBe(false)

    const emptyExclude = createContext(mergeConfigs([
      { content: { pipeline: { exclude: [] } } },
      { presets: [] },
    ]))
    await emptyExclude.ready

    // An empty exclude removes the CSS exclusion; the default include still
    // applies.
    expect(emptyExclude.filter('flex', `${cwd}/src/foo.vue`)).toBe(true)
    expect(emptyExclude.filter('const a = 1', `${cwd}/src/foo.ts`)).toBe(false)
  })

  it('treats a falsy non-pattern include as undeclared', async () => {
    const cwd = process.cwd()
    // `||` (not `??`): an empty string falls back to the defaults instead of
    // building a matcher that would match nothing.
    const ctx = createContext({ content: { pipeline: { include: '' } } })

    await ctx.ready

    expect(ctx.filter('flex', `${cwd}/src/foo.vue`)).toBe(true)
    expect(ctx.filter('const a = 1', `${cwd}/src/foo.ts`)).toBe(false)
    expect(ctx.filter('.a {}', `${cwd}/src/foo.css`)).toBe(false)
  })

  it('preserves explicitly empty patterns when merging configs', async () => {
    const cwd = process.cwd()
    // `[]` means "no constraint" and must survive `mergeConfigs()`.
    const config = mergeConfigs([
      { content: { pipeline: { include: [], exclude: [] } } },
      { content: {} },
    ])
    expect(config.content?.pipeline).toEqual({ include: [], exclude: [] })

    const ctx = createContext(config)
    await ctx.ready

    expect(ctx.filter('flex', `${cwd}/src/foo.ts`)).toBe(true)
    expect(ctx.filter('flex', `${cwd}/src/foo.css`)).toBe(true)
    expect(ctx.filter('code', '\0virtual:foo.ts')).toBe(false)
  })

  it('createPipelineFilter unions include and intersects exclude across bases', () => {
    const cwd = process.cwd()
    // Same order as the vue-scoped mode: build tool root first, project root last.
    const filter = createPipelineFilter(
      ['app/**/*.ts'],
      ['app/**/*.spec.ts'],
      [`${cwd}/app`, cwd],
    )

    expect(filter(`${cwd}/app/useFoo.ts`)).toBe(true)
    expect(filter(`${cwd}/app/useFoo.spec.ts`)).toBe(false)
    expect(filter(`${cwd}/other/useFoo.ts`)).toBe(false)
    expect(filter('\0virtual:foo.ts')).toBe(false)
  })

  it('keeps project-root-relative pipeline.include matching when the root is a sub directory (#3242)', async () => {
    const cwd = process.cwd()
    // Nuxt reports `srcDir` as the root while patterns are project-root relative.
    const config = mergeConfigs([
      { content: { pipeline: { include: ['app/composables/**/*.ts'], exclude: [/\?macro=true/] } } },
      { presets: [] },
    ])

    const ctx = createContext(config)
    await ctx.ready
    await ctx.updateRoot(`${cwd}/app`)

    expect(ctx.filter('code', `${cwd}/app/composables/useFoo.ts`)).toBe(true)
    // The merged exclude also rejects candidates that pass the include.
    expect(ctx.filter('code', `${cwd}/app/composables/useFoo.ts?macro=true`)).toBe(false)
    // The explicit include replaces the defaults, so `.vue` is not a target.
    expect(ctx.filter('code', `${cwd}/app/pages/index.vue`)).toBe(false)
  })

  it('resolves string patterns against the build root when the config is passed as a path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unocss-config-'))
    try {
      const configFile = join(dir, 'uno.config.mjs')
      await writeFile(configFile, `export default ${JSON.stringify({ content: { pipeline: { include: ['src/**/*.ts'] } } })}\n`)

      const ctx = createContext(configFile)
      await ctx.ready
      await ctx.updateRoot(dir)

      // Patterns are relative to the build root, not to the config file itself.
      expect(ctx.filter('code', `${dir}/src/foo.ts`)).toBe(true)
      expect(ctx.filter('code', `${dir}/other/foo.ts`)).toBe(false)
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('resolves string patterns for a config directory after the root is updated', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'unocss-config-dir-'))
    try {
      const configFile = join(dir, 'uno.config.mjs')
      await writeFile(configFile, `export default ${JSON.stringify({ content: { pipeline: { include: ['src/**/*.ts'] } } })}\n`)

      // The language server passes the workspace directory, then updates the
      // root to it. Point the initial load at the same file so the test does not
      // depend on a config living in `process.cwd()`.
      const ctx = createContext(dir, {}, [{ files: configFile, extensions: [] }])
      await ctx.ready
      await ctx.updateRoot(dir)

      expect(ctx.filter('code', `${dir}/src/foo.ts`)).toBe(true)
      expect(ctx.filter('code', `${dir}/other/foo.ts`)).toBe(false)
    }
    finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('does not reload the config when the root is only spelled differently', async () => {
    const cwd = process.cwd()
    const ctx = createContext({})
    await ctx.ready

    let reloads = 0
    ctx.onReload(() => reloads++)

    // Build tools report their root with forward slashes, while `process.cwd()`
    // keeps the platform separator on Windows.
    await ctx.updateRoot(`${cwd}/`)
    expect(reloads).toBe(0)

    if (process.platform === 'win32') {
      await ctx.updateRoot(cwd.replace(/\\/g, '/'))
      expect(reloads).toBe(0)
    }

    await ctx.updateRoot(`${cwd}/sub`)
    expect(reloads).toBe(1)
  })
})

describe('config reload order', () => {
  it('runs a queued reload after an earlier reload fails', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'unocss-reload-failure-')))
    const configFile = join(root, 'uno.config.ts')
    await writeFile(configFile, `export default { rules: [['probe', { color: 'red' }]] }`)
    let shouldFail = true
    const resolveConfigResult = () => {
      if (shouldFail) {
        shouldFail = false
        throw new Error('reload failed')
      }
    }

    try {
      const ctx = createContext(configFile, {}, [], resolveConfigResult)
      const failed = expect(ctx.ready).rejects.toThrow('reload failed')
      const queued = ctx.reloadConfig()

      await failed
      await queued

      expect(ctx.getConfigFileList()).toEqual([configFile])
      expect((await ctx.uno.generate('probe', { preflights: false })).css).toContain('.probe{color:red;}')
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('keeps the latest root when an earlier load finishes last', async () => {
    const first = await realpath(await mkdtemp(join(tmpdir(), 'unocss-reload-first-')))
    const second = await realpath(await mkdtemp(join(tmpdir(), 'unocss-reload-second-')))
    const globals = globalThis as { __unoReloadFirstStarted?: boolean, __unoReloadSecond?: () => void, __unoReloadSecondLoaded?: Promise<void> }
    globals.__unoReloadSecondLoaded = new Promise<void>(done => globals.__unoReloadSecond = done)
    await writeFile(join(first, 'uno.config.ts'), `globalThis.__unoReloadFirstStarted = true
await Promise.race([globalThis.__unoReloadSecondLoaded, new Promise(done => setTimeout(done, 200))])
export default { rules: [['from-first', { color: 'red' }]] }`)
    await writeFile(join(second, 'uno.config.ts'), `globalThis.__unoReloadSecond()
export default { rules: [['from-second', { color: 'blue' }]] }`)
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(first)

    try {
      const ctx = createContext()
      const initialLoad = ctx.ready
      await vi.waitFor(() => expect(globals.__unoReloadFirstStarted).toBe(true))
      await Promise.all([ctx.updateRoot(second), initialLoad])

      expect(ctx.getConfigFileList()).toEqual([join(second, 'uno.config.ts')])
      expect((await ctx.uno.generate('from-first from-second', { preflights: false })).css).toContain('from-second')
      expect((await ctx.uno.generate('from-first from-second', { preflights: false })).css).not.toContain('from-first')
    }
    finally {
      cwd.mockRestore()
      delete globals.__unoReloadFirstStarted
      delete globals.__unoReloadSecond
      delete globals.__unoReloadSecondLoaded
      await rm(first, { recursive: true, force: true })
      await rm(second, { recursive: true, force: true })
    }
  })
})
