import type { SourceCodeTransformer } from '@unocss/core'
import { describe, expect, it, vi } from 'vitest'
import { createContext } from '../src/context'
import { applyTransformers } from '../src/transformers'

describe('applyTransformers', () => {
  it('preserves transformer order and source maps', async () => {
    const transformers: SourceCodeTransformer[] = [
      {
        name: 'first',
        idFilter: () => true,
        transform(code) {
          code.overwrite(0, 3, 'one')
        },
      },
      {
        name: 'second',
        idFilter: () => true,
        transform(code) {
          code.append(' three')
        },
      },
    ]
    const ctx = createContext({ transformers })
    await ctx.ready

    const result = await applyTransformers(ctx, 'two', 'fixture.ts')

    expect(result?.code).toBe('one three')
    expect(result?.map.sources).toEqual(['fixture.ts'])
  })

  it('does not invoke transformers rejected by their id filter', async () => {
    const transform = vi.fn()
    const ctx = createContext({
      transformers: [
        {
          name: 'filtered',
          idFilter: id => id.endsWith('.vue'),
          transform,
        },
      ],
    })
    await ctx.ready

    expect(await applyTransformers(ctx, 'const value = 1', 'fixture.ts')).toBeUndefined()
    expect(transform).not.toHaveBeenCalled()
  })

  it('does not invoke transformers rejected by their code filter', async () => {
    const transform = vi.fn()
    const codeFilter = vi.fn((code: string) => code.includes(':('))
    const ctx = createContext({
      transformers: [
        {
          name: 'filtered',
          idFilter: () => true,
          codeFilter,
          transform,
        },
      ],
    })
    await ctx.ready

    expect(await applyTransformers(ctx, 'const value = 1', 'fixture.ts')).toBeUndefined()
    expect(codeFilter).toHaveBeenCalledWith('const value = 1', 'fixture.ts')
    expect(transform).not.toHaveBeenCalled()
  })

  it('uses the transformers from a reloaded config', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const config: { transformers: SourceCodeTransformer[] } = {
      transformers: [
        {
          name: 'transformer',
          idFilter: () => true,
          transform: first,
        },
      ],
    }
    const ctx = createContext(config)
    await ctx.ready
    await applyTransformers(ctx, 'const value = 1', 'fixture.ts')

    config.transformers = [
      {
        name: 'transformer',
        idFilter: () => true,
        transform: second,
      },
    ]
    await ctx.reloadConfig()
    await applyTransformers(ctx, 'const value = 1', 'fixture.ts')

    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
  })
})
