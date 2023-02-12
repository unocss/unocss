import { createGenerator, toEscapedSelector as e } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetAttributify, { autocompleteExtractorAttributify, variantAttributify } from '@unocss/preset-attributify'
import { describe, expect, test } from 'vitest'

describe('attributify', () => {
  const fixture1 = `
<button
  uno-layer-base="c-white/10 hover:c-black/20"
  sm="[color:red]"
  md="[--var:var(--another)]"
  lg="bg-blue-600"
  class="absolute fixed"
  important="text-red bg-red"
  bg="blue-400 hover:blue-500 dark:!blue-500 dark:hover:blue-600"
  text="sm white"
  !leading-4
  flex="!~ col"
  p="t-2"
  pt="2"
  border="rounded-xl x-1 x-style-dashed"
  :font="foo > bar ? 'mono' : 'sans'"
  v-bind:p="y-2 x-4"
  border="2 rounded blue-200"
  un-children="m-auto"
  x-transition:enter-start="opacity-0"
  :x-transition:enter-start="opacity-0"
  v-bind:x-transition:enter-start="opacity-0"
  pt2 rounded-sm
  size="w-1 h-0.5"
  inline-block
  transform
  translate-x-100%
  translate-y-[10%]
  rotate-30
  after="content-[quoted:uno_css]"
  rotate-60="" ma=""
  m='\`
  1 2
  3
\`'
  ml-1.5
  ml-1..6
>
  Button
</button>
`

  const fixture2 = `
<template>
  <div h-80 text-center flex flex-col align-center select-none all:transition-400>
    <input type="checkbox" peer placeholder=">" class="<md:color-red" mt-a>
    <div mb-a group peer-checked="text-4xl">
      <div
        font-100 text-4xl mb--3 p-10
        bg-gradient="to-r from-yellow-400 via-red-500 to-pink-500"
      >
        ~
      </div>
      <div text-5xl font-100 sm="bg-blue-600">
        unocss
      </div>
      <div op-20 font-200 mt-1 tracking-wider group-hover="text-teal-400 op-50">
        Re-imaging Atomic CSS
      </div>
    </div>
  </div>
  <div flex>
    <div ma inline-flex relative h-14>
      <input type="text" m-0 pt-4 px-4 text-true-gray-800 peer placeholder="unocss" un-placeholder="text-red">
      <label absolute leading-1rem left-4 pointer-events-none text-gray-7 top="1/3" transition="200 linear"
        peer-not-placeholder-shown="-translate-y-4 scale-75 origin-top-left text-green-500"
        peer-focus="-translate-y-4 scale-75 origin-top-left text-green-500"
        before-content="[quoted:!]"
        after="content-[string:!]"
      >Experience now</label>
    </div>
  </div>
</template>
`

  const fixture3 = `
<div custom="1" class="custom-2">
<div>
`

  // jsx
  const fixture4 = `
    <button
  uno-layer-base={"c-white/10 hover:c-black/20"}
  sm={"[color:red]"}
  md={"[--var:var(--another)]"}
  lg={"bg-blue-600"}
  class={"absolute fixed"}
  important={"text-red bg-red"}
  bg={ withBg ? "sky-400 hover:sky-500" : "transparent" }
  font={foo > bar ? 'mono' : 'sans'}
  bg={"blue-400 hover:blue-500 dark:!blue-500 dark:hover:blue-600"}
  text={"sm white"}
  flex="!~ col"
  p="t-2"
  pt="2"
  border="rounded-xl x-1 x-style-dashed"
  border="2 rounded blue-200"
  un-children={"m-auto"}
  pt2 rounded-sm
  inline-block
  transform
  translate-x-100
  rotate-30
  after={"content-[quoted:uno-css]"}
  rotate-60="" ma=""
  m='\`
  1 2
  3
\`'
  ml-1.5
>
  Button
</button>
  `

  const uno = createGenerator({
    presets: [
      presetAttributify({ strict: true }),
      presetUno({ attributifyPseudo: true }),
    ],
    rules: [
      [/^custom-(\d+)$/, ([_, value], { rawSelector }) => {
        // return a string instead of an object
        const selector = e(rawSelector)
        return `
  ${selector} {
    font-size: ${value}px;
  }
  /* you can have multiple rules */
  ${selector}::after {
    content: 'after';
  }
  .foo > ${selector} {
    color: red;
  }
  /* or media queries */
  @media (min-width: 680px) {
    ${selector} {
      font-size: 16px;
    }
  }
  `
      }],
    ],
  })

  test('extractor1', async () => {
    expect(await uno.applyExtractors(fixture1)).toMatchSnapshot()
  })

  test('extractor2', async () => {
    expect(await uno.applyExtractors(fixture2)).toMatchSnapshot()
  })

  test('extractor4', async () => {
    expect(await uno.applyExtractors(fixture4)).toMatchSnapshot()
  })

  test('variant', async () => {
    const variant = variantAttributify({
      prefix: 'un-',
      prefixedOnly: false,
      strict: true,
    })

    expect(Array.from(await uno.applyExtractors(fixture1) || [])
      .map((i) => {
        const r = variant.match(i, {} as any)
        return typeof r === 'string' ? r : r ? r.matcher : r
      }))
      .toMatchSnapshot()
  })

  test('prefixedOnly', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true, prefix: 'un-', prefixedOnly: true }),
        presetUno({ attributifyPseudo: true }),
      ],
    })

    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  test('fixture1', async () => {
    const { css } = await uno.generate(fixture1, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  test('fixture2', async () => {
    const { css } = await uno.generate(fixture2, { preflights: false })
    expect(css).toMatchSnapshot()
  })

  test('fixture4', async () => {
    const { css } = await uno.generate(fixture4, { preflights: false })
    expect(css).toMatchSnapshot()

    test('autocomplete extractor', async () => {
      const res = await autocompleteExtractorAttributify.extract({
        content: fixture1,
        cursor: 187,
      })

      expect(res).not.toBeNull()

      expect(res!.extracted).toMatchInlineSnapshot('"bg-blue-400"')
      expect(res!.transformSuggestions!([`${res!.extracted}1`, `${res!.extracted}2`]))
        .toMatchInlineSnapshot(`
        [
          "blue-4001",
          "blue-4002",
        ]
      `)

      const reversed = res!.resolveReplacement(`${res!.extracted}1`)
      expect(reversed).toMatchInlineSnapshot(`
      {
        "end": 193,
        "replacement": "blue-4001",
        "start": 185,
      }
    `)

      expect(fixture1.slice(reversed.start, reversed.end))
        .toMatchInlineSnapshot('"blue-400"')
    })

    test('compatible with full controlled rules', async () => {
      const { css } = await uno.generate(fixture3, { preflights: false })
      expect(css).toMatchSnapshot()
    })

    test('with trueToNonValued', async () => {
      const uno = createGenerator({
        presets: [
          presetAttributify({ trueToNonValued: true }),
          presetUno(),
        ],
      })
      const { css } = await uno.generate(`
      <div flex="true"></div>
      <div grid="~ cols-2"></div>
    `, { preflights: false })
      expect(css).toMatchSnapshot()
    })

    test('with incomplete element', async () => {
      await uno.generate('<div class="w-fullllllllllllll"')
    }, 20)
  })
})
