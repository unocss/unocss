import type { UnocssPluginContext } from '@unocss/core'
import { cssUrlTransformer, replaceRelativeCssUrl } from '@unocss/rule-utils'
import MagicString from 'magic-string'
import { describe, expect, it, vi } from 'vitest'

describe('css url transformer', async () => {
  vi.mock('node:fs', async () => {
    return {
      existsSync: vi.fn(path => !/@/.test(path)),
    }
  })

  it('relative path transform to absolute path', async () => {
    const result = replaceRelativeCssUrl('url(./assets/foo.png)', '/project/src/main.ts', '/project')
    expect(result).toBe('url(/src/assets/foo.png)')
  })

  it('skip alias path', async () => {
    const result = replaceRelativeCssUrl('url("@/assets/foo.png")', '/project/src/main.ts', '/project')
    expect(result).toBe('url("@/assets/foo.png")')
  })

  it('skip http url', async () => {
    const result = replaceRelativeCssUrl('url(https://example.com/foo.png)', '/project/src/main.ts', '/project')
    expect(result).toBe('url(https://example.com/foo.png)')
  })

  const transformer = cssUrlTransformer()

  async function transform(code: string) {
    const s = new MagicString(code)
    await transformer.transform(s, '/project/src/main.ts', { root: '/project' } as UnocssPluginContext)
    return s.toString()
  }

  it('transform relative path transform to absolute path', async () => {
    const result = await transform('bg-[url(./assets/foo.png)]')
    expect(result).toBe('bg-[url(/src/assets/foo.png)]')
  })

  it('transform alias path', async () => {
    const result = await transform('bg-[url("@/assets/foo.png")]')
    expect(result).toBe('bg-[url("@/assets/foo.png")]')
  })

  it('transform http url', async () => {
    const result = await transform('bg-[url(https://example.com/foo.png)]')
    expect(result).toBe('bg-[url(https://example.com/foo.png)]')
  })
})
