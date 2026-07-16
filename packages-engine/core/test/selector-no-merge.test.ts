import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { variantMatcher } from '@unocss/preset-mini/utils'
import { describe, expect, it } from 'vitest'

describe('selector', async () => {
  const uno = await createGenerator({
    rules: [
      [/^to-merge$/, () => [{ merged: 1 }]],
      [/^merge-candidate$/, () => ({ merged: 1 })],
      [/^not-merged$/, () => ({ merged: 1 }), { noMerge: true }],
    ],
  })

  it('rules split selector', async () => {
    const { css } = await uno.generate('to-merge merge-candidate not-merged')
    expect(css).toMatchSnapshot()
  })
})

describe('variant', async () => {
  const uno = await createGenerator({
    shortcuts: [
      [/^m1-(.+)$/, ([, s]) => `moz:${s} webkit:${s}`],
      [/^m2-(.+)$/, ([, s]) => `moz:${s} merge-candidate`],
      [/^m3-(.+)$/, ([, s]) => `moz:${s} merge-candidate-early`],
    ],
    variants: [
      variantMatcher('moz', s => ({ pseudo: `${s.pseudo}::non-breaking` })),
      variantMatcher('webkit', s => ({ pseudo: `${s.pseudo}::breaking` })),
    ],
    rules: [
      [/^no-merge$/, () => ({ merged: 1 }), { noMerge: true }],
      ['merge-candidate', { merged: 1 }],

      ['merge-candidate-early', { late: 2 }],
      [/^no-merge-ordered$/, () => ({ late: 2 }), { noMerge: true }],
    ],
  })

  it('variant split selector', async () => {
    const { css } = await uno.generate('moz:no-merge webkit:no-merge')
    expect(css).toMatchSnapshot()
  })

  it('variant split shortcuts', async () => {
    const { css } = await uno.generate('m1-no-merge')
    expect(css).toMatchSnapshot()
  })

  it('variant shortcuts early', async () => {
    const { css } = await uno.generate('m2-no-merge')
    expect(css).toMatchSnapshot()
  })

  it('variant shortcuts late', async () => {
    const { css } = await uno.generate('m3-no-merge-ordered')
    expect(css).toMatchSnapshot()
  })
})

// https://github.com/unocss/unocss/issues/4872
describe('vendor-prefixed pseudo-elements', async () => {
  const uno = await createGenerator({
    presets: [presetMini()],
  })

  it('does not merge different vendor pseudo-elements into one selector list', async () => {
    const { css } = await uno.generate([
      '[&::-webkit-slider-runnable-track]:h-full',
      '[&::-moz-range-track]:h-full',
      '[&::-webkit-slider-thumb]:h-full',
    ].join(' '), { preflights: false })

    // Each vendor pseudo-element must stay in its own rule. A browser drops the
    // whole selector list when it contains a pseudo-element it doesn't know, so
    // grouping `::-webkit-*` next to `::-moz-*` would break the valid ones too.
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .\\[\\&\\:\\:-moz-range-track\\]\\:h-full::-moz-range-track{height:100%;}
      .\\[\\&\\:\\:-webkit-slider-runnable-track\\]\\:h-full::-webkit-slider-runnable-track{height:100%;}
      .\\[\\&\\:\\:-webkit-slider-thumb\\]\\:h-full::-webkit-slider-thumb{height:100%;}"
    `)
  })

  it('still merges standard pseudo-elements sharing the same body', async () => {
    const { css } = await uno.generate('[&::before]:h-full [&::after]:h-full', { preflights: false })
    // guard is scoped to vendor prefixes: standard pseudo-elements still merge
    // into a single selector list with one body.
    expect((css.match(/height:100%/g) || []).length).toBe(1)
    expect(css).toContain('::after,')
  })
})
