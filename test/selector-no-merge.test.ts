import { createGenerator } from '@unocss/core'
import { variantMatcher } from '@unocss/preset-mini/utils'
import { describe, expect, test } from 'vitest'

describe('selector', () => {
  const uno = createGenerator({
    rules: [
      [/^to-merge$/, () => [{ merged: 1 }]],
      [/^merge-candidate$/, () => ({ merged: 1 })],
      [/^not-merged$/, () => ({ merged: 1 }), { noMerge: true }],
    ],
  })

  test('rules split selector', async() => {
    const { css } = await uno.generate('to-merge merge-candidate not-merged')
    expect(css).toMatchSnapshot()
  })
})

describe('variant', () => {
  const uno = createGenerator({
    variants: [
      variantMatcher('moz', s => `${s}::non-breaking`),
      variantMatcher('webkit', s => `${s}::breaking`),
    ],
    rules: [
      [/^no-merge$/, () => ({ merged: 1 }), { noMerge: true }],
    ],
  })

  test('variant split selector', async() => {
    const { css } = await uno.generate('moz:no-merge webkit:no-merge')
    expect(css).toMatchSnapshot()
  })
})
