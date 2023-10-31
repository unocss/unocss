import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'

describe('generate-async', () => {
  it('rule-first', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(1)
          resolve('/* rule */')
        }, 10))],
      ],
      preflights: [
        {
          getCSS: () => new Promise(resolve => setTimeout(() => {
            order.push(2)
            resolve('/* preflight */')
          }, 20)),
        },
      ],
    })
    await uno.generate('rule')
    expect(order).eql([1, 2])
  })

  it('preflight at the end', async () => {
    const order: number[] = []
    const uno = createGenerator({
      rules: [
        [/^rule$/, () => new Promise(resolve => setTimeout(() => {
          order.push(1)
          resolve('/* rule */')
        }, 20))],
      ],
      preflights: [
        {
          getCSS: () => new Promise((resolve) => {
            order.push(2)
            resolve('/* preflight */')
          }),
        },
      ],
    })
    await uno.generate('rule')
    expect(order).eql([1, 2])
  })

  it('generate css', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      shortcuts: [
        {
          'foo': 'text-red',
          'foo-bar': 'text-red',
        },
        [/^btn-(red|green)$/, m => `text-${m[1]}`],
      ],
    })
    const data = await uno.generate('text-black text-white btn-red btn-green text-blue text-purple', { preflights: false })
    expect(data.css)
      .toMatchInlineSnapshot(`
        "/* layer: shortcuts */
        .btn-red{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}
        .btn-green{--un-text-opacity:1;color:rgb(74 222 128 / var(--un-text-opacity));}
        /* layer: default */
        .text-black{--un-text-opacity:1;color:rgb(0 0 0 / var(--un-text-opacity));}
        .text-white{--un-text-opacity:1;color:rgb(255 255 255 / var(--un-text-opacity));}
        .text-blue{--un-text-opacity:1;color:rgb(96 165 250 / var(--un-text-opacity));}
        .text-purple{--un-text-opacity:1;color:rgb(192 132 252 / var(--un-text-opacity));}"
      `)
  })
})
