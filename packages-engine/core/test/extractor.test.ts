import { extractorSplit } from '@unocss/core'
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants'
import { expect, it } from 'vitest'

it('extractorSplit', async () => {
  async function extract(code: string) {
    return [...await extractorSplit.extract?.({ code, original: code } as any) || []]
  }

  expect(await extract('foo')).eql(['foo'])
  expect(await extract('<div class="text-red border">foo</div>')).toContain('text-red')
  expect(await extract('<div class="<sm:text-lg">foo</div>')).toContain('<sm:text-lg')
  expect(await extract('"class=\"bg-white\""')).toContain('bg-white')
  expect(await extract('<div :class="{ fixed: isMobile }">')).toContain('fixed')
})

it('extractorSplit extracts unquoted HTML class attributes', async () => {
  async function extract(code: string) {
    return [...await extractorSplit.extract?.({ code, original: code } as any) || []]
  }

  const classAttribute = await extract('<div class=foo id=ignored>')
  expect(classAttribute).toContain('foo')
  expect(classAttribute).not.toContain('class=foo')

  const selfClosingClassAttribute = await extract('<div class=hover:bg-red-500/>')
  expect(selfClosingClassAttribute).toContain('hover:bg-red-500')
  expect(selfClosingClassAttribute).not.toContain('class=hover:bg-red-500/>')

  for (const code of ['<div class = text-red-500>', '<div class= text-red-500>']) {
    const whitespaceClassAttribute = await extract(code)
    expect(whitespaceClassAttribute).toContain('text-red-500')
    expect(whitespaceClassAttribute).not.toContain('text-red-500>')
  }

  for (const code of ['<div class=foo=bar>', '<div class=foo"bar>', '<div class=foo{bar}>', '<div class=foo<bar>'])
    expect(await extract(code)).not.toContain('foo')

  const unquotedAttributes = await extract('<div id=ignored data-class=ignored className=ignored :class=ignored title="class=ignored">')
  expect(unquotedAttributes).not.toContain('ignored')

  expect(await extract('<div class={active}>')).eql(['<div', 'class=', 'active', '>'])
})

it('extractorSplitArbitrary', async () => {
  async function extract(code: string) {
    return [...await extractorArbitraryVariants().extract!({ code, original: code } as any) || []]
  }

  expect(await extract('<div class="[content:\'bar:baz\'] [foo:bar:baz]">')).not.contains('[foo:bar:baz]')
  expect(await extract('<div class="after:content-[&#39;&#39;]">')).not.toContain('after:content-[&#39;&#39;]')
})
