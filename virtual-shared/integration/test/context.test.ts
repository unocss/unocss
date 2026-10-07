import { describe, expect, it } from 'vitest'
import { createContext } from '../src/context'

describe('createContext', () => {
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
  })

  it('returns false for every id when pipeline is disabled', async () => {
    const cwd = process.cwd()
    const ctx = createContext({ content: { pipeline: false } })

    await ctx.ready
    await ctx.updateRoot(`${cwd}/src`)

    expect(ctx.filter('code', `${cwd}/src/foo.ts`)).toBe(false)
  })
})
