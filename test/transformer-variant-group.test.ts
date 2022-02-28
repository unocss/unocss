import { describe, expect, test } from 'vitest'
import { transformVariantGroups } from '@unocss/transformer-variant-group'
import MagicString from 'magic-string'

describe('transformer-variant-group', () => {
  async function transform(code: string) {
    const s = new MagicString(code)
    transformVariantGroups(s)
    return s.toString()
  }

  test('basic', async() => {
    const cases = [
      'bg-white font-light sm:hover:(bg-gray-100 font-medium)',
      'lt-sm:hover:(p-1 p-2)',
      'sm:(p-1 p-2)',
      'dark:lg:(p-1 p-2)',
      'at-lg:(p-1 p-2)',
      'md:(w-40vw pr-4.5rem)',
      'lt-md:(grid grid-cols-[1fr,50%])',
      '!hover:(m-2 p-2)',
      'hover:(!m-2 p-2)',
      'md:(w-1/2 h-[calc(100%-4rem)])',
      'hover:(\n!m-2 \np-2\n)',
    ]

    for (const c of cases) {
      const result = await transform(c)
      expect(result).toMatchSnapshot(`"${c}"`)
    }
  })
})
