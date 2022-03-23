import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetAttributify, { variantAttributify } from '@unocss/preset-attributify'
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
  border="rounded-xl"
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

  const uno = createGenerator({
    presets: [
      presetAttributify({ strict: true }),
      presetUno({ attributifyPseudo: true }),
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
})
