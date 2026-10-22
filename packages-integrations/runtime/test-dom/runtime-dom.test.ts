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

  async function flushObserver() {
    await new Promise(resolve => setTimeout(resolve, 50))
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

  it('runtime extracts arbitrary variants from elements added after init', async () => {
    const runtime = await initRuntime()
    const doc = window.document

    runtime?.toggleObserver(false)
    await flushObserver()

    // `outerHTML` serialises `&` in an attribute value as `&amp;`, so an
    // arbitrary variant only survives extraction once the entity is decoded.
    const el = doc.createElement('div')
    el.setAttribute('class', 'm-1 [&_th]:sticky [&_td]:block')
    doc.body.appendChild(el)
    expect(el.outerHTML).toContain('[&amp;_th]:sticky [&amp;_td]:block')
    await flushObserver()

    const result = await runtime?.update()
    expect(result?.css).toContain('.m-1{margin:0.25rem;}')
    expect(result?.css).toContain('.\\[\\&_th\\]\\:sticky th{position:sticky;}')
    expect(result?.css).toContain('.\\[\\&_td\\]\\:block td{display:block;}')
  })

  it('runtime extracts arbitrary variants from attribute mutations', async () => {
    const runtime = await initRuntime()
    const doc = window.document

    runtime?.toggleObserver(false)
    await flushObserver()

    const el = doc.createElement('div')
    doc.body.appendChild(el)
    await flushObserver()

    el.setAttribute('class', '[&_tr]:hidden')
    await flushObserver()

    const result = await runtime?.update()
    expect(result?.css).toContain('.\\[\\&_tr\\]\\:hidden tr{display:none;}')
  })

  it('runtime extracts a late element exactly like one present on the first scan', async () => {
    const doc = window.document
    const className = 'm-1 [&_th]:sticky before:content-[\'&\']'

    const early = doc.createElement('div')
    early.setAttribute('class', className)
    doc.body.appendChild(early)
    const first = await initRuntime()
    await first?.extractAll()
    const cssOnFirstScan = (await first?.update())?.css
    early.remove()

    const second = await initRuntime()
    second?.toggleObserver(false)
    await flushObserver()
    const late = doc.createElement('div')
    late.setAttribute('class', className)
    doc.body.appendChild(late)
    await flushObserver()
    const cssForLateElement = (await second?.update())?.css

    expect(cssOnFirstScan).toContain('.\\[\\&_th\\]\\:sticky th{position:sticky;}')
    expect(cssForLateElement).toBe(cssOnFirstScan)
  })
})
