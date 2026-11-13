import type { StringifiedUtil, UserConfig } from '@unocss/core'
import { createGenerator, symbols } from '@unocss/core'
import { expect, it } from 'vitest'

it.each([false, true])('preserves grouped CSS and parent order with minify=%s', async (minify) => {
  const config: UserConfig = {
    outputToCssLayers: true,
    rules: [
      [/^u-(\d+)$/, ([, value]) => ({
        color: Number(value) % 2 ? 'red' : 'blue',
        [symbols.layer]: Number(value) % 3 ? 'utilities' : 'components',
        [symbols.parent]: [`@media (min-width:${Number(value) % 4}px)`, -(Number(value) % 4)],
      })],
      ['plain', { display: 'block' }],
    ],
    preflights: [{ layer: 'reset', getCSS: () => '*{box-sizing:border-box;}' }],
  }
  const grouped = await createGenerator(config)
  const live = await createGenerator({
    ...config,
    processors: [{ name: 'identity', process: css => css }],
  })
  const tokens = ['plain', ...Array.from({ length: 24 }, (_, index) => `u-${index}`)]
  for (let pass = 0; pass < 2; pass++) {
    const actual = await grouped.generate(tokens, { minify, scope: '.scope' })
    const expected = await live.generate(tokens, { minify, scope: '.scope' })
    expect(actual.css).toBe(expected.css)
    expect(actual.layers).toEqual(expected.layers)
    for (const layer of actual.layers)
      expect(actual.getLayer(layer)).toBe(expected.getLayer(layer))
  }
})

it.each(['processor', 'alias'])('keeps live metadata between layers with a %s callback', async (kind) => {
  let cached: StringifiedUtil[]
  const mutate = (layer: string) => {
    if (layer === 'a')
      cached[0][4]!.layer = 'c'
  }
  const uno = await createGenerator({
    rules: [['a', { color: 'red' }, { layer: 'a' }], ['b', { color: 'blue' }, { layer: 'b' }]],
    ...(kind === 'processor'
      ? { processors: [{ name: 'mutate', process: (css: string, ctx: { layer: string }) => {
          mutate(ctx.layer)
          return css
        } }] }
      : { outputToCssLayers: { cssLayerName: (layer: string) => {
          mutate(layer)
          return layer
        } } }),
  })
  cached = (await uno.parseToken('b'))!
  const result = await uno.generate(['a', 'b'])
  expect(result.getLayer('b')).toBe('')
  expect(result.getLayer('c')).toContain('.b{color:blue;}')
})

it('reads live payloads for a layer omitted by sortLayers', async () => {
  const uno = await createGenerator({
    rules: [['a', { color: 'red' }, { layer: 'a' }], ['b', { color: 'blue' }, { layer: 'b' }]],
    sortLayers: layers => layers.filter(layer => layer !== 'b'),
  })
  const cached = (await uno.parseToken('a'))!
  const result = await uno.generate(['a', 'b'])
  cached[0][4]!.layer = 'b'
  expect(result.getLayer('b')).toContain('.a{color:red;}')
  expect(result.getLayer('b')).toContain('.b{color:blue;}')
})
