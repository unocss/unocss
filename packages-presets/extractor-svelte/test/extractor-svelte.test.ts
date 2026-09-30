import { createGenerator } from '@unocss/core'
import extractorSvelte from '@unocss/extractor-svelte'
import { expect, it } from 'vitest'

it('extractorSvelte extracts static unquoted class attributes only in .svelte files', async () => {
  const uno = await createGenerator({ extractors: [extractorSvelte()] })
  const regular = await createGenerator()
  for (const code of [
    '<div class=text-red-500>',
    '<div class = text-red-500 >',
    '<div\nclass\t=\ntext-red-500>',
    '<div id={id} class=text-red-500>',
    '<div id={a > b} class=text-red-500>',
    '<div id={{ nested: { value: ">" } }} class=text-red-500>',
    '<div {...props} class=text-red-500>',
    '<Component class=text-red-500 />',
    '<div title="class=ignored" class=text-red-500>',
    '<div title="{a > b ? ">" : "<"}" class=text-red-500>',
  ]) {
    expect(await uno.applyExtractors(code, 'file.svelte')).toContain('text-red-500')
    expect(await uno.applyExtractors(code, 'file.html')).eql(await regular.applyExtractors(code, 'file.html'))
  }
  expect(await uno.applyExtractors('<div class=hover:bg-red-500 />', 'file.svelte')).toContain('hover:bg-red-500')
})

it('extractorSvelte preserves slashes in unquoted values', async () => {
  const uno = await createGenerator({ extractors: [extractorSvelte()] })
  for (const code of ['<div class=foo//>', '<div class=foo/ >', '<div class=foo/']) {
    const extracted = await uno.applyExtractors(code, 'file.svelte')
    expect(extracted).toContain('foo/')
    expect(extracted).not.toContain('foo')
  }
  expect(await uno.applyExtractors('<div class=foo />', 'file.svelte')).toContain('foo')
  expect(await uno.applyExtractors('<div class=foo/>', 'file.svelte')).toContain('foo')
  expect(await uno.applyExtractors('<div class=w-1/2>', 'file.svelte')).toContain('w-1/2')
})

it('extractorSvelte does not extract partial or unrelated attribute values', async () => {
  const uno = await createGenerator({ extractors: [extractorSvelte()] })
  for (const code of [
    '<div class=foo=bar>',
    '<div class=foo/bar=baz>',
    '<div class=foo"bar>',
    '<div class=foo`bar>',
    '<div class=foo<bar>',
    '<div class=foo{bar}>',
    '<div data-class=foo className=foo :class=foo>',
    '<div title="class=foo">',
    '<div title=" class=foo ">',
    '<div id={" class=foo "}>',
    '<div class=foo{a > b}bar>',
  ])
    expect(await uno.applyExtractors(code, 'file.svelte')).not.toContain('foo')

  const code = '<div class={active} class:fixed={isMobile}>'
  const extracted = await uno.applyExtractors(code, 'file.svelte')
  expect(extracted).toContain('active')
  expect(extracted).toContain('fixed')
})

it('extractorSvelte generates CSS for static unquoted classes', async () => {
  const uno = await createGenerator({
    extractors: [extractorSvelte()],
    rules: [['test-unquoted', { display: 'block' }]],
  })
  const unquoted = await uno.generate('<div class=test-unquoted />', { id: 'file.svelte' })
  const quoted = await uno.generate('<div class="test-unquoted" />', { id: 'file.svelte' })
  expect(unquoted.matched).toContain('test-unquoted')
  expect(unquoted.css).toBe(quoted.css)
})

it('extractorSvelte uses regular split with non .svelte files', async () => {
  const uno = await createGenerator({
    extractors: [
      extractorSvelte(),
    ],
  })

  async function extract(code: string) {
    return Array.from(await uno.applyExtractors(code))
  }

  expect(await extract('foo')).eql(['foo'])
  expect(await extract('<div class="text-red border">foo</div>')).toContain('text-red')
  expect(await extract('<div class="<sm:text-lg">foo</div>')).toContain('<sm:text-lg')
  expect(await extract('"class=\"bg-white\""')).toContain('bg-white')

  expect(await extract('<div class:text-orange-400={foo} />')).toContain('class:text-orange-400=')
  expect(await extract('class:text-gray-800={$page.url.pathname.startsWith(\'/test\')}')).toContain('class:text-gray-800=')
  expect(await extract('<div class="data-[a~=b]:text-red">foo</div>')).toContain('data-[a~=b]:text-red')
  expect(await extract('<div class:text-[32px]="{true}" />')).toContain('class:text-[32px]=')
})

it('extractorSvelte uses svelte-specific split with .svelte files', async () => {
  const uno = await createGenerator({
    extractors: [
      extractorSvelte(),
    ],
  })

  async function extract(code: string) {
    return Array.from(await uno.applyExtractors(code, 'file.svelte'))
  }

  expect(await extract('foo')).eql(['foo'])
  expect(await extract('<div class="text-red border">foo</div>')).toContain('text-red')
  expect(await extract('<div class="<sm:text-lg">foo</div>')).toContain('<sm:text-lg')
  expect(await extract('"class=\"bg-white\""')).toContain('bg-white')

  expect(await extract('<div class:text-orange-400={foo} />')).toContain('text-orange-400')
  expect(await extract('class:text-gray-800={$page.url.pathname.startsWith(\'/test\')}')).toContain('text-gray-800')
  expect(await extract('<div class="data-[a~=b]:text-red">foo</div>')).toContain('data-[a~=b]:text-red')
  expect(await extract('<div class:text-[32px]="{true}" />')).toContain('text-[32px]')
})
