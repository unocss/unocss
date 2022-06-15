import { describe, expect, it } from 'vitest'
import { searchUsageBoundary } from '@unocss/autocomplete'

describe('searchUsageBoundary', () => {
  it('works', () => {
    expect(searchUsageBoundary('', 0).content)
      .toMatchInlineSnapshot('""')

    expect(searchUsageBoundary('<div class="p-1 p-2', 14).content)
      .toMatchInlineSnapshot('"p-1"')

    expect(searchUsageBoundary('<div :class="`p-1 p-2', 16).content)
      .toMatchInlineSnapshot('"p-1"')

    expect(searchUsageBoundary('<div p-1 p-2>', 10).content)
      .toMatchInlineSnapshot('"p-2"')

    expect(searchUsageBoundary('.a{ @apply p-2; }', 14).content)
      .toMatchInlineSnapshot('"p-2"')
  })
})
