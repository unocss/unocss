import type { FilterPattern } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { createContext } from '#integration/context'

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

  it('returns false for every id when pipeline is disabled', async () => {
    const cwd = process.cwd()
    const ctx = createContext({ content: { pipeline: false } })

    await ctx.ready
    await ctx.updateRoot(`${cwd}/src`)

    expect(ctx.filter('code', `${cwd}/src/foo.ts`)).toBe(false)
  })
})
