/// <reference types="vitest/globals" />

import presetWind3 from '@unocss/preset-wind3'
import initUnocssRuntime from '@unocss/runtime'

describe('runtime dom manipulation', async () => {
  afterEach(() => {
    window.document.documentElement.innerHTML = ''
  })

  async function initRuntime(options?: any) {
    await initUnocssRuntime({
      defaults: {
        presets: [
          presetWind3(),
        ],
        ...options,
      },
      ready() {
        return false
      },
    })

    return window.__unocss_runtime
  }

  it('runtime generates multiple styles', async () => {
    const runtime = await initRuntime()

    await runtime?.extract('container mt0')
    const result = await runtime?.update()
    const layers = [...(result?.getStyleElements().keys() ?? [])]

    layers.forEach((layer) => {
      const expected = `/* layer: ${layer} */`
      expect(result?.css).toContain(expected)

      const style = result?.getStyleElement(layer)
      expect(style?.tagName).equals('STYLE')
      expect(style?.innerHTML).toContain(expected)
    })
  })

  it('runtime can retrieve styles ordered by layer', async () => {
    const runtime = await initRuntime({
      layers: {
        pre: -10,
        default: 10,
        ammend: 20,
        preflights: 100,
      },
    })

    await runtime?.extract('uno-layer-pre:pt-0 uno-layer-[ammend]:pb-0 p-0')
    const result = await runtime?.update()

    const layers = [...(result?.getStyleElements().keys() ?? [])]
    expect(layers).toMatchObject(['pre', 'default', 'ammend', 'preflights'])
  })

  it('runtime styles is placed in order', async () => {
    const runtime = await initRuntime()

    await runtime?.extract('ring-red')
    const result = await runtime?.update()

    const doc = window.document
    expect(doc.documentElement.firstElementChild).toEqual(result?.getStyleElement('preflights'))
    expect(doc.documentElement.firstElementChild?.nextElementSibling).toEqual(result?.getStyleElement('default'))
    expect(doc.documentElement.firstElementChild?.nextElementSibling?.nextElementSibling).toEqual(doc.head)
  })
})
