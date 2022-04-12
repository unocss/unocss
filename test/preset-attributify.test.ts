import { createGenerator, toEscapedSelector as e } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetAttributify, { autocompleteExtractorAttributify, variantAttributify } from '@unocss/preset-attributify'
import { describe, expect, test } from 'vitest'

describe('attributify', () => {
  const fixture1 = `
<button
  layer-base="c-white/10 hover:c-black/20"
  sm="[color:red]"
  md="[--var:var(--another)]"
  lg="bg-blue-600"
  class="absolute fixed"
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
  pt2 rounded-sm
  inline-block
  transform
  translate-x-100%
  translate-y-[10%]
  rotate-30
  after="content-unocss"
  rotate-60="" ma=""
  m='\`
  1 2
  3
\`'
>
  Button
</button>
`

  const fixture2 = `
<template>
  <div h-80 text-center flex flex-col align-center select-none all:transition-400>
    <input type="checkbox" peer mt-a>
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
      <input type="text" m-0 pt-4 px-4 text-true-gray-800 peer placeholder>
      <label absolute leading-1rem left-4 pointer-events-none text-gray-7 top="1/3" transition="200 linear"
        peer-not-placeholder-shown="-translate-y-4 scale-75 origin-top-left text-green-500"
        peer-focus="-translate-y-4 scale-75 origin-top-left text-green-500"
        before="content-!"
        after="content-[!]"
      >Experience now</label>
    </div>
  </div>
</template>
`

  const fixture3 = `
<div custom="1" class="custom-2">
<div>
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

  test('extractor1', async() => {
    expect(await uno.applyExtractors(fixture1)).toMatchSnapshot()
  })

  test('extractor2', async() => {
    expect(await uno.applyExtractors(fixture2)).toMatchSnapshot()
  })

  test('variant', async() => {
    const variant = variantAttributify({
      prefix: 'un-',
      prefixedOnly: false,
      strict: true,
    })

    expect(Array.from(await uno.applyExtractors(fixture1) || [])
      .map((i) => {
        const r = variant(i, {} as any)
        return typeof r === 'string' ? r : r ? r.matcher : r
      }))
      .toMatchSnapshot()
  })

  test('fixture1', async() => {
    const { css } = await uno.generate(fixture1)
    expect(css).toMatchSnapshot()
  })

  test('fixture2', async() => {
    const { css } = await uno.generate(fixture2)
    expect(css).toMatchSnapshot()
  })

  test('autocomplete extractor', async() => {
    const res = await autocompleteExtractorAttributify.extract({
      content: fixture1,
      cursor: 187,
    })

    expect(res).not.toBeNull()

    expect(res!.extracted).toMatchInlineSnapshot('"dark:!bg-blue-500"')
    expect(res!.transformSuggestions!([`${res!.extracted}1`, `${res!.extracted}2`]))
      .toMatchInlineSnapshot(`
        [
          "dark:!blue-5001",
          "dark:!blue-5002",
        ]
      `)

    const reversed = res!.resolveReplacement(`${res!.extracted}1`)
    expect(reversed).toMatchInlineSnapshot(`
      {
        "end": 189,
        "replacement": "dark:!blue-5001",
        "start": 175,
      }
    `)

    expect(fixture1.slice(reversed.start, reversed.end))
      .toMatchInlineSnapshot('"dark:!blue-500"')
    expect(fixture1.slice(0, reversed.start) + reversed.replacement + fixture1.slice(reversed.end))
      .toMatchSnapshot()
  })

  test('compatible with full controlled rules', async() => {
    const { css } = await uno.generate(fixture3)
    expect(css).toMatchSnapshot()
  })
})
