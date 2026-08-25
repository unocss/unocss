import { createGenerator } from '@unocss/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import processorLightningCSS from '../src'

describe('processor-lightningcss', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('transforms CSS in Node.js', async () => {
    const processor = processorLightningCSS({ minify: true })

    expect(processor.name).toBe('@unocss/processor-lightningcss')
    await expect(
      processor.process('.foo { color: red; }', { layer: 'default', theme: {}, envMode: 'build' }),
    )
      .resolves
      .toBe('.foo{color:red}')
  })

  it('uses the layer name as the filename', async () => {
    const processor = processorLightningCSS()

    await expect(processor.process('}', { layer: 'utilities', theme: {}, envMode: 'build' }))
      .rejects
      .toMatchObject({ fileName: 'utilities.css' })
  })

  it('processes every generated layer and reapplies after setLayer', async () => {
    const uno = await createGenerator({
      rules: [
        ['a', { color: 'red' }, { layer: 'a' }],
        ['b', { color: 'blue' }, { layer: 'b' }],
      ],
      processors: [processorLightningCSS({ minify: true })],
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
    const processor = processorLightningCSS()
    const css = '.foo { color: red; }'

    const context = { layer: 'default', theme: {}, envMode: 'build' as const }
    await expect(processor.process(css, context)).resolves.toBe(css)
    await expect(processor.process(css, context)).resolves.toBe(css)

    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(
      '[unocss]',
      '@unocss/processor-lightningcss is not supported in non-Node.js environments; returning CSS unchanged',
    )
  })
})
