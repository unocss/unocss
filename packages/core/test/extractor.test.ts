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

it('extractorSplitArbitrary', async () => {
  async function extract(code: string) {
    return [...await extractorArbitraryVariants.extract!({ code, original: code } as any) || []]
  }

  expect(await extract('<div class="[content:\'bar:baz\'] [foo:bar:baz]">')).not.contains('[foo:bar:baz]')
})
