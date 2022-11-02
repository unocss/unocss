import { extractorSplit, extractorSvelte } from '@unocss/core'
import { expect, it } from 'vitest'

it('extractorSplit', async () => {
  async function extract(code: string) {
    return [...await extractorSplit.extract({ code, original: code }) || []]
  }

  expect(await extract('foo')).eql(['foo'])
  expect(await extract('<div class="text-red border">foo</div>')).toContain('text-red')
  expect(await extract('<div class="<sm:text-lg">foo</div>')).toContain('<sm:text-lg')
  expect(await extract('"class=\"bg-white\""')).toContain('bg-white')
})

it('extractorSvelte uses regular split with non .svelte files', async () => {
  async function extract(code: string) {
    return [...await extractorSvelte.extract({ code, original: code }) || []]
  }

  expect(await extract('foo')).eql(['foo'])
  expect(await extract('<div class="text-red border">foo</div>')).toContain('text-red')
  expect(await extract('<div class="<sm:text-lg">foo</div>')).toContain('<sm:text-lg')
  expect(await extract('"class=\"bg-white\""')).toContain('bg-white')

  expect(await extract('<div class:text-orange-400={foo} class="shortcut" />')).toMatchInlineSnapshot(`
    [
      "<div",
      "class:text-orange-400=",
      "foo",
      "class=",
      "shortcut",
      "/>",
    ]
  `)
  expect(await extract('class:text-gray-800={$page.url.pathname.startsWith(\'/test\')}')).toMatchInlineSnapshot(`
    [
      "class:text-gray-800=",
      "$page.url.pathname.startsWith(",
      "/test",
      ")",
    ]
  `)

  expect(await extract('<div class="data-[a~=b]:text-red">foo</div>')).toMatchInlineSnapshot(`
    [
      "<div",
      "class=",
      "data-[a~=b]:text-red",
      ">foo</div>",
    ]
  `)
})

it('extractorSvelte uses svelte-specific split with .svelte files', async () => {
  async function extract(code: string) {
    return [...await extractorSvelte.extract({ code, original: code, id: 'file.svelte' }) || []]
  }

  expect(await extract('foo')).eql(['foo'])
  expect(await extract('<div class="text-red border">foo</div>')).toContain('text-red')
  expect(await extract('<div class="<sm:text-lg">foo</div>')).toContain('<sm:text-lg')
  expect(await extract('"class=\"bg-white\""')).toContain('bg-white')

  expect(await extract('<div class:text-orange-400={foo} class="shortcut" />')).toMatchInlineSnapshot(`
    [
      "<div",
      "text-orange-400",
      "foo",
      "class=",
      "shortcut",
      "/>",
    ]
  `)
  expect(await extract('class:text-gray-800={$page.url.pathname.startsWith(\'/test\')}')).toMatchInlineSnapshot(`
    [
      "text-gray-800",
      "$page.url.pathname.startsWith(",
      "/test",
      ")",
    ]
  `)

  expect(await extract('<div class="data-[a~=b]:text-red">foo</div>')).toMatchInlineSnapshot(`
    [
      "<div",
      "class=",
      "data-[a~=b]:text-red",
      ">foo</div>",
    ]
  `)
})
