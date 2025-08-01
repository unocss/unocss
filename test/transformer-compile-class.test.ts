import type { UnoGenerator } from '@unocss/core'
import type { CompileClassOptions } from '@unocss/transformer-compile-class'
import { createGenerator } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import transformerCompileClass from '@unocss/transformer-compile-class'
import MagicString from 'magic-string'
import { describe, expect, it, vi } from 'vitest'

const CUSTOM_TRIGGER = /(["'`]):custom-?(?<name>[^\s\\1]+)?:\s([^\\1]*?)\1/g

describe('transformer-compile-class', () => {
  function createUno(options?: CompileClassOptions) {
    return createGenerator({
      presets: [
        presetWind3(),
      ],
      transformers: [
        transformerCompileClass(options),
      ],
    })
  }

  async function transform(code: string, uno?: UnoGenerator, invalidate = () => 0) {
    uno ||= await createUno()
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
      "<div class="uno-qe05lz">
      <div class="foo bar">

      <div class="uno-qlmcrp foo">
        <div class="uno-0qw2gr"/>
      </div>"
    `)
    expect(result.css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .uno-qe05lz{--un-scale-x:0.05;--un-scale-y:0.05;transform:translateX(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));border-width:1px;--un-border-opacity:1;border-color:rgb(229 231 235 / var(--un-border-opacity));--un-bg-opacity:1;background-color:rgb(239 68 68 / var(--un-bg-opacity));font-size:1.25rem;line-height:1.75rem;font-weight:700;}
      .dark .uno-qe05lz:hover{--un-bg-opacity:1;background-color:rgb(34 197 94 / var(--un-bg-opacity));}
      .uno-qlmcrp{text-align:center;}
      .uno-0qw2gr{font-size:0.875rem;line-height:1.25rem;font-weight:700;}
      .uno-0qw2gr:hover{--un-text-opacity:1;color:rgb(248 113 113 / var(--un-text-opacity));}
      @media (min-width: 640px){
      .uno-qlmcrp{text-align:left;}
      }"
    `)
  })

  it('custom class name trigger (without class name)', async () => {
    const result = await transform(
      '<div class=":custom: bg-red-500 text-xl">'.trim(),
      await createUno({ trigger: CUSTOM_TRIGGER }),
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
      await createUno({
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
      await createUno({ trigger: CUSTOM_TRIGGER }),
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
    }).rejects.toMatchInlineSnapshot(`[Error: Duplicated compile class name "uno-foo". One is "w-2" and the other is "w-1". Please choose different class name or set 'alwaysHash' to 'true'.]`)
  })

  it('normal class name should not conflicts', async () => {
    const result = await transform(`
<div class=":uno: w-1 h-1"/>
<div class=":uno: w-2 h-2"/>
<div class=":uno: h-1 w-1"/>
    `)

    expect(result.code.trim()).toMatchInlineSnapshot(`
      "<div class="uno-d5cxre"/>
      <div class="uno-o9cz6y"/>
      <div class="uno-prhvrm"/>"
    `)
  })

  it('css should be updated exact times when compiled class changes', async () => {
    const invalidateFn = vi.fn()
    const uno = await createUno()

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
