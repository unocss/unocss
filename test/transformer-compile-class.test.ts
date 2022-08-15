import { describe, expect, test } from 'vitest'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import transformerCompileClass from '@unocss/transformer-compile-class'
import presetUno from '@unocss/preset-uno'

describe('transformer-compile-class', () => {
  const uno = createGenerator({
    presets: [
      presetUno(),
    ],
  })
  const transformer = transformerCompileClass()

  async function transform(code: string, _uno: UnoGenerator = uno) {
    const s = new MagicString(code)
    await transformer.transform(s, 'foo.js', { uno: _uno, tokens: new Set() } as any)
    const result = s.toString()
    const { css } = await uno.generate(result, { preflights: false })
    return {
      code: result,
      css,
    }
  }

  test('basic', async () => {
    const result = await transform(`
    <div class=":uno: bg-red-500 text-xl font-bold border border-gray-200 dark:hover:bg-green-500 transform scale-5">
    <div class=":uno: foo bar">

    <div class=":uno: text-center sm:text-left foo">
      <div class=":uno: text-sm font-bold hover:text-red"/>
    </div>
    `)
    expect(result).toMatchInlineSnapshot(`
      {
        "code": "
          <div class=\\"uno-pe1esh\\">
          <div class=\\"foo bar\\">

          <div class=\\"uno-cbgd7b foo\\">
            <div class=\\"uno-s9yxer\\"/>
          </div>
          ",
        "css": "/* layer: shortcuts */
      .uno-pe1esh{--un-scale-x:0.05;--un-scale-y:0.05;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));border-width:1px;border-style:solid;--un-border-opacity:1;border-color:rgba(229,231,235,var(--un-border-opacity));--un-bg-opacity:1;background-color:rgba(239,68,68,var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;font-weight:700;}
      .dark .uno-pe1esh:hover{--un-bg-opacity:1;background-color:rgba(34,197,94,var(--un-bg-opacity));}
      .uno-cbgd7b{text-align:center;}
      .uno-s9yxer{font-size:0.875rem;line-height:1.25rem;font-weight:700;}
      .uno-s9yxer:hover{--un-text-opacity:1;color:rgba(248,113,113,var(--un-text-opacity));}
      @media (min-width: 640px){
      .uno-cbgd7b{text-align:left;}
      }",
      }
    `)
  })

  test('different sequence of utility classes', async () => {
    const order1 = await transform('<div class=":uno: flex bg-blue-400 my-awesome-class font-bold"></div>')
    const order2 = await transform('<div class=":uno: my-awesome-class bg-blue-400  font-bold flex"></div>')

    expect(order1.css).toBe(order2.css)
    expect(order1.code).toBe(order2.code)
  })
})
