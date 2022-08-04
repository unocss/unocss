import { extractorSplit } from '@unocss/core'
import { expect, it } from 'vitest'

it('extractorSplit', async () => {
  let code = ''
  async function extract() {
    return [...await extractorSplit.extract({ code, original: code }) || []]
  }

  code = 'foo'
  expect(await extract()).eql(['foo'])

  code = '<div class="text-red border">foo</div>'
  expect(await extract()).toContain('text-red')

  code = '<div class="<sm:text-lg">foo</div>'
  expect(await extract()).toContain('<sm:text-lg')

  code = '"class=\"bg-white\""'
  expect(await extract()).toContain('bg-white')
})
