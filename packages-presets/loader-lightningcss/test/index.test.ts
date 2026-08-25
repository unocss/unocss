import { createGenerator } from '@unocss/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import loaderLightningCSS from '../src'

describe('loader-lightningcss', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('transforms CSS in Node.js', async () => {
    const loader = loaderLightningCSS({ minify: true })

    expect(loader.name).toBe('@unocss/loader-lightningcss')
    await expect(
      loader.load('.foo { color: red; }', { layer: 'default' }),
    )
      .resolves
      .toBe('.foo{color:red}')
  })

  it('uses the layer name as the filename', async () => {
    const loader = loaderLightningCSS()

    await expect(loader.load('}', { layer: 'utilities' }))
      .rejects
      .toMatchObject({ fileName: 'utilities.css' })
  })

  it('processes every generated layer and reapplies after setLayer', async () => {
    const uno = await createGenerator({
      rules: [
        ['a', { color: 'red' }, { layer: 'a' }],
        ['b', { color: 'blue' }, { layer: 'b' }],
      ],
      loaders: [loaderLightningCSS({ minify: true })],
    })

    const result = await uno.generate('a b')

    expect(result.getLayer('a')).toBe('.a{color:red}')
    expect(result.getLayer('b')).toBe('.b{color:#00f}')
    expect(result.getLayers()).toBe(result.css)

    await result.setLayer('a', async (css) => {
      expect(css).toContain('/* layer: a */')
      return css.replace('red', 'green')
    })

    expect(result.getLayer('a')).toBe('.a{color:green}')
    expect(result.getLayers()).toBe(result.css)
  })

  it('warns once and returns CSS unchanged outside Node.js', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    const loader = loaderLightningCSS()
    const css = '.foo { color: red; }'

    await expect(loader.load(css, { layer: 'default' })).resolves.toBe(css)
    await expect(loader.load(css, { layer: 'default' })).resolves.toBe(css)

    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(
      '[unocss]',
      '@unocss/loader-lightningcss is not supported in non-Node.js environments; returning CSS unchanged',
    )
  })
})
