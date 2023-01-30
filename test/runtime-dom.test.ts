// @vitest-environment jsdom

import { describe, expect, test } from 'vitest'
import initUnocssRuntime from '@unocss/runtime'
import presetUno from '@unocss/preset-uno'

describe('runtime dom manipulation', () => {
  function initRuntime(options?: Object) {
    initUnocssRuntime({
      defaults: {
        presets: [
          presetUno(),
        ],
        ...options,
      },
      ready() {
        return false
      },
    })

    return window.__unocss_runtime
  }

  test('runtime generates multiple styles', async () => {
    const runtime = initRuntime()

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

  test('runtime can retrieve styles ordered by layer', async () => {
    const runtime = initRuntime({
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
})
