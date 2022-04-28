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

  test('rules split selector', async () => {
    const { css } = await uno.generate('to-merge merge-candidate not-merged')
    expect(css).toMatchSnapshot()
  })
})

describe('variant', () => {
  const uno = createGenerator({
    shortcuts: [
      [/^m1-(.+)$/, ([, s]) => `moz:${s} webkit:${s}`],
      [/^m2-(.+)$/, ([, s]) => `moz:${s} merge-candidate`],
      [/^m3-(.+)$/, ([, s]) => `moz:${s} merge-candidate-early`],
    ],
    variants: [
      variantMatcher('moz', s => `${s}::non-breaking`),
      variantMatcher('webkit', s => `${s}::breaking`),
    ],
    rules: [
      [/^no-merge$/, () => ({ merged: 1 }), { noMerge: true }],
      ['merge-candidate', { merged: 1 }],

      ['merge-candidate-early', { late: 2 }],
      [/^no-merge-ordered$/, () => ({ late: 2 }), { noMerge: true }],
    ],
  })

  test('variant split selector', async () => {
    const { css } = await uno.generate('moz:no-merge webkit:no-merge')
    expect(css).toMatchSnapshot()
  })

  test('variant split shortcuts', async () => {
    const { css } = await uno.generate('m1-no-merge')
    expect(css).toMatchSnapshot()
  })

  test('variant shortcuts early', async () => {
    const { css } = await uno.generate('m2-no-merge')
    expect(css).toMatchSnapshot()
  })

  test('variant shortcuts late', async () => {
    const { css } = await uno.generate('m3-no-merge-ordered')
    expect(css).toMatchSnapshot()
  })
})
