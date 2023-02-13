import { readFile } from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { expandVariantGroup } from '@unocss/core'
import MagicString from 'magic-string'

describe('transformer-variant-group', () => {
  async function transform(code: string) {
    const s = new MagicString(code)
    expandVariantGroup(s)
    return s.toString()
  }

  test('basic', async () => {
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
      '[&]:(w-4 h-4) [&]:(w-4 h-4)',
    ]

    for (const c of cases) {
      const result = await transform(c)
      expect(result).toMatchSnapshot(`"${c}"`)
    }
  })

  test('vue file with strict sep', async () => {
    async function transform(code: string) {
      const s = new MagicString(code)
      expandVariantGroup(s, [':'])
      return s.toString()
    }

    const file = await readFile('./test/assets/variant-group.vue', 'utf-8')
    const result = await transform(file)
    expect(result).toMatchInlineSnapshot(`
      "<script setup lang=\\"ts\\">
      const a = 1
      const b = 2
      // eslint-disable-next-line @typescript-eslint/space-infix-ops
      const c = a-(b -a -b)
      </script>

      <template>
        <div class=\\"bg-white font-light sm:hover:bg-gray-100 sm:hover:font-medium\\" />
        <div class=\\"lt-sm:hover:p-1 lt-sm:hover:p-2\\" />
        <div class=\\"sm:p-1 sm:p-2\\" />
        <div class=\\"dark:lg:p-1 dark:lg:p-2\\" />
        <div class=\\"hover:bg-red hover:text-green hover:dark:bg-cyan hover:dark:text-pink\\" />
      </template>
      "
    `)
  })

  test('empty group', async () => {
    const result = await transform(
      'hover:()',
    )
    expect(result).toMatchInlineSnapshot('"hover:()"')
  })

  test('ignore arrow fn', async () => {
    const result = await transform(`
      {
        hover:(p6) => {
          console.log('ok')
        },
      }
    `)
    expect(result).toMatchInlineSnapshot(`
      "
            {
              hover:(p6) => {
                console.log('ok')
              },
            }
          "
    `)
  })
})
