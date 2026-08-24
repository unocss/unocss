import { createGenerator } from '@unocss/core'
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

describe('indexed selector merge', () => {
  it('merges a large selector set without changing scope, order, or noMerge output', async () => {
    const uno = await createGenerator({
      rules: [
        [/^merge-(\d+)$/, () => ({ color: 'red' })],
        ['not-merged', { color: 'red' }, { noMerge: true }],
      ],
    })
    const tokens = Array.from({ length: 250 }, (_, index) => `merge-${index}`)
    const expectedSelectors = tokens
      .map(token => `.scope .${token}`)
      .sort((a, b) => a.localeCompare(b))

    for (const minify of [false, true]) {
      const { css } = await uno.generate([...tokens, 'not-merged'], { minify, preflights: false, scope: '.scope' })
      const [mergedSelectors] = css
        .replace('/* layer: default */\n', '')
        .split('{color:red;}')

      expect(mergedSelectors.split(minify ? ',' : ',\n')).toEqual(expectedSelectors)
      expect(css.match(/\{color:red;\}/g)).toHaveLength(2)
      expect(css).toContain('.scope .not-merged{color:red;}')
    }
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
