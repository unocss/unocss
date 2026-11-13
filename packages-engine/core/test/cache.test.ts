import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('preserves cache query ordering, misses, aliases, invalidation, and config reset', async () => {
  const uno = await createGenerator({ rules: [['a', { color: 'red' }], ['b', { color: 'red' }]] })
  await uno.parseToken('b')
  await uno.parseToken('missing')
  await uno.parseToken('a')
  await uno.parseToken('a', 'alias')
  expect(uno.getCachedTokens('')).toEqual(['b', 'a', 'a alias'])
  expect(uno.getCachedTokens('a')).toEqual(['a', 'a alias'])
  expect(uno.getCachedAliases('a')).toEqual(['b', 'a', 'a alias'])
  expect(uno.getCachedAliases('missing')).toBeUndefined()
  uno.invalidateToken('a')
  expect(uno.getCachedTokens('')).toEqual(['b', 'a alias'])
  await uno.setConfig({})
  expect(uno.getCachedTokens('')).toEqual([])
})
