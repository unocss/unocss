import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('normal presets', async () => {
  const uno = await createGenerator({
    presets: [
      {
        name: 'foo',
        rules: [
          ['foo', { name: 'bar1' }],
          ['foo', { name: 'bar2' }],
        ],
      },
    ],
  })
  const { css } = await uno.generate('foo', { preflights: false })
  expect(css).toContain('bar2')
})

it('promise presets', async () => {
  const uno = await createGenerator({
    presets: [
      Promise.resolve({
        name: 'foo',
        rules: [
          ['foo', { name: 'bar1' }],
          ['foo', { name: 'bar2' }],
        ],
      }),
    ],
  })
  const { css } = await uno.generate('foo', { preflights: false })
  expect(css).toContain('bar2')
})

it('async function presets', async () => {
  const uno = await createGenerator({
    presets: [
      async () => {
        await new Promise(r => setTimeout(r, 100))
        return {
          name: 'foo',
          rules: [
            ['foo', { name: 'bar1' }],
            ['foo', { name: 'bar2' }],
          ],
        }
      },
    ],
  })
  const { css } = await uno.generate('foo', { preflights: false })
  expect(css).toContain('bar2')
})
