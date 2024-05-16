import { describe, expect, it, vi } from 'vitest'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import MagicString from 'magic-string'
import type { CompileClassOptions } from '@unocss/transformer-compile-class'
import transformerCompileClass from '@unocss/transformer-compile-class'
import presetUno from '@unocss/preset-uno'

// eslint-disable-next-line regexp/strict
const CUSTOM_TRIGGER = /(["'`]):custom-?(?<name>[^\s\1]+)?:\s([^\1]*?)\1/g

describe('transformer-compile-class', () => {
  function createUno(options?: CompileClassOptions) {
    return createGenerator({
      presets: [
        presetUno(),
      ],
      transformers: [
        transformerCompileClass(options),
      ],
    })
  }

  async function transform(code: string, uno: UnoGenerator = createUno(), invalidate = () => 0) {
    const s = new MagicString(code)
    invalidate = invalidate || vi.fn()

    for (const t of uno.config.transformers || [])
      await t.transform(s, 'foo.js', { uno, tokens: new Set(), invalidate } as any)

    const result = s.toString()
    const { css } = await uno.generate(result, { preflights: false })
    return {
      code: result,
      css,
    }
  }

  it('basic', async () => {
    const result = await transform(`
<div class=":uno: bg-red-500 text-xl font-bold border border-gray-200 dark:hover:bg-green-500 transform scale-5">
<div class=":uno: foo bar">

<div class=":uno: text-center sm:text-left foo">
  <div class=":uno: text-sm font-bold hover:text-red"/>
</div>
    `.trim())
    expect(result.code.trim()).toMatchInlineSnapshot(`
      "<div class="uno-pe1esh">
      <div class="foo bar">

      <div class="uno-cbgd7b foo">
        <div class="uno-s9yxer"/>
      </div>"
    `)
    expect(result.css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-pe1esh{--un-scale-x:0.05;--un-scale-y:0.05;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));border-width:1px;--un-border-opacity:1;border-color:rgb(229 231 235 / var(--un-border-opacity));--un-bg-opacity:1;background-color:rgb(239 68 68 / var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;font-weight:700;}
      .dark .uno-pe1esh:hover{--un-bg-opacity:1;background-color:rgb(34 197 94 / var(--un-bg-opacity));}
      .uno-cbgd7b{text-align:center;}
      .uno-s9yxer{font-size:0.875rem;line-height:1.25rem;font-weight:700;}
      .uno-s9yxer:hover{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}
      @media (min-width: 640px){
      .uno-cbgd7b{text-align:left;}
      }"
    `)
  })

  it('different sequence of utility classes', async () => {
    const order1 = await transform('<div class=":uno: flex bg-blue-400 my-awesome-class font-bold"></div>')
    const order2 = await transform('<div class=":uno: my-awesome-class bg-blue-400  font-bold flex"></div>')

    expect(order1.css).toBe(order2.css)
    expect(order1.code).toBe(order2.code)
  })

  it('custom class name trigger (without class name)', async () => {
    const result = await transform(
      '<div class=":custom: bg-red-500 text-xl">'.trim(),
      createUno({ trigger: CUSTOM_TRIGGER }),
    )

    expect(result.code.trim()).toMatchInlineSnapshot(`"<div class="uno-trmz0g">"`)

    expect(result.css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-trmz0g{--un-bg-opacity:1;background-color:rgb(239 68 68 / var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;}"
    `)
  })

  it('custom class name trigger (with basic class name)', async () => {
    const result = await transform(
      '<div class=":custom-foo: bg-red-500 text-xl">'.trim(),
      createUno({
        trigger: CUSTOM_TRIGGER,
        classPrefix: 'something-',
      }),
    )

    expect(result.code.trim()).toMatchInlineSnapshot(`"<div class="something-foo">"`)

    expect(result.css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .something-foo{--un-bg-opacity:1;background-color:rgb(239 68 68 / var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;}"
    `)
  })

  it('custom class name trigger (with complex class name)', async () => {
    const result = await transform(
      '<div class=":custom-foo_bar-baz: bg-red-500 text-xl">'.trim(),
      createUno({ trigger: CUSTOM_TRIGGER }),
    )

    expect(result.code.trim()).toMatchInlineSnapshot(`"<div class="uno-foo_bar-baz">"`)

    expect(result.css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-foo_bar-baz{--un-bg-opacity:1;background-color:rgb(239 68 68 / var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;}"
    `)
  })

  it('custom class name conflicts', async () => {
    await expect(async () => {
      await transform(`
      <div class=":uno-foo: w-1"/>
      <div class=":uno-foo: w-2"/>
    `.trim())
    }).rejects
      .toMatchInlineSnapshot(`[Error: Duplicated compile class name "uno-foo". One is "w-2" and the other is "w-1". Please choose different class name or set 'alwaysHash' to 'true'.]`)
  })

  it('custom class name should not conflict when the content is the same', async () => {
    const result = await transform(`
<div class=":uno-foo: h-1 w-1"/>
<div class=":uno-foo: w-1 h-1"/>
    `.trim())

    expect(result.code.trim()).toMatchInlineSnapshot(`
      "<div class="uno-foo"/>
      <div class="uno-foo"/>"
    `)

    expect(result.css.trim()).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-foo{height:0.25rem;width:0.25rem;}"
    `)
  })

  it('normal class name should not conflicts', async () => {
    const result = await transform(`
<div class=":uno: w-1 h-1"/>
<div class=":uno: w-2 h-2"/>
<div class=":uno: h-1 w-1"/>
    `)

    expect(result.code.trim()).toMatchInlineSnapshot(`
      "<div class="uno-prhvrm"/>
      <div class="uno-umiu5u"/>
      <div class="uno-prhvrm"/>"
    `)
  })

  it('css should be updated exact times when compiled class changes', async () => {
    const invalidateFn = vi.fn()
    const uno = createUno()

    await transform(`
    <div class=":uno: w-1 h-1"/>
        `.trim(), uno, invalidateFn)

    await transform(`
    <div class=":uno: w-1 h-2"/>
        `.trim(), uno, invalidateFn)

    await transform(`
    <div class=":uno: w-1 h-1"/>
        `.trim(), uno, invalidateFn)

    expect(invalidateFn).toHaveBeenCalledTimes(2)
  })
})
