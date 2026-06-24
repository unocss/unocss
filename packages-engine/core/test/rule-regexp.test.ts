import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('supports dynamic rules that cannot be combined into a filter', async () => {
  const uno = await createGenerator({
    rules: [
      [/^(foo)-\1$/, () => ({ color: 'red' })],
      [/(?<=lookbehind-)value$/, () => ({ color: 'green' })],
      [/^(?<name>baz)$/, () => ({ color: 'blue' })],
      [/^global-.+$/g, () => ({ color: 'orange' })],
      [/^qux$/i, () => ({ color: 'purple' })],
      [/^plain-.+$/, () => ({ color: 'black' })],
    ],
  })

  const { matched } = await uno.generate(new Set([
    'foo-foo',
    'lookbehind-value',
    'baz',
    'global-value',
    'QUX',
    'plain-value',
    'unmatched',
  ]), { preflights: false })

  expect([...matched]).toEqual([
    'foo-foo',
    'lookbehind-value',
    'baz',
    'global-value',
    'QUX',
    'plain-value',
  ])
})
