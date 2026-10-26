import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('preserves dynamic rule precedence and the order seen by configResolved', async () => {
  let order: (number | undefined)[] = []
  const uno = await createGenerator({
    rules: [
      [/^x$/, () => ({ color: 'red' })],
      ['fixed', { display: 'block' }],
      [/^x$/, () => ({ color: 'blue' })],
      [/^x$/, () => undefined],
      [/^x$/, () => ({ color: 'green' }), { prefix: 'p-' }],
    ],
    configResolved: (config) => { order = config.rulesDynamic.map(rule => rule[2]?.__index) },
  })
  expect(order).toEqual([4, 3, 2, 0])
  const { css } = await uno.generate('x p-x fixed')
  expect(css).toContain('.x{color:blue;}')
  expect(css).toContain('.p-x{color:green;}')
  expect(css).toContain('.fixed{display:block;}')
})
