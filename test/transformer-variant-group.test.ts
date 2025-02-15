import type { UnocssPluginContext } from '@unocss/core'
import { readFile } from 'node:fs/promises'
import { expandVariantGroup } from '@unocss/core'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import MagicString from 'magic-string'
import { describe, expect, it } from 'vitest'

const transformer = transformerVariantGroup()

describe('transformer-variant-group', () => {
  async function transform(code: string) {
    const s = new MagicString(code)
    const result = await transformer.transform(s, '', {} as UnocssPluginContext)
    return { transformed: s.toString(), annotations: result!.highlightAnnotations }
  }

  it('basic', async () => {
    const cases = [
      'a1 a2:(b1 b2:(c1 c2-(d1 d2) c3) b3) a3',
      'bg-white font-light sm:hover:(bg-gray-100 font-medium)',
      'lt-sm:hover:(p-1 p-2)',
      '<sm:hover:(p-1 p-2)',
      'sm:(p-1 p-2)',
      'dark:lg:(p-1 p-2)',
      'at-lg:(p-1 p-2)',
      'md:(w-40vw pr-4.5rem)',
      'lt-md:(grid grid-cols-[1fr,50%])',
      '<md:(grid grid-cols-[1fr,50%])',
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

  it('vue file with strict sep', async () => {
    async function transform(code: string) {
      const s = new MagicString(code)
      expandVariantGroup(s, [':'])
      return s.toString()
    }

    const file = await readFile('./test/assets/variant-group.vue', 'utf-8')
    const result = await transform(file)
    expect(result).toMatchInlineSnapshot(`
      "<script setup lang="ts">
      const a = 1
      const b = 2
      // eslint-disable-next-line style/space-infix-ops
      const _c = a-(b -a -b)
      </script>

      <template>
        <div class="bg-white font-light sm:hover:bg-gray-100 sm:hover:font-medium" />
        <div class="lt-sm:hover:p-1 lt-sm:hover:p-2" />
        <div class="<sm:p-1 <sm:p-2" />
        <div class="sm:p-1 sm:p-2" />
        <div class="dark:lg:p-1 dark:lg:p-2" />
        <div class="hover:bg-red hover:text-green hover:dark:bg-cyan hover:dark:text-pink" />
      </template>
      "
    `)
  })

  it('empty group', async () => {
    const result = await transform(
      'hover:()',
    )
    expect(result).toMatchInlineSnapshot(`
      {
        "annotations": [],
        "transformed": "hover:()",
      }
    `)
  })

  it('ignore arrow fn', async () => {
    const result = await transform(`
      {
        hover:(p6) => {
          console.log('ok')
        },
      }
    `)
    expect(result).toMatchInlineSnapshot(`
      {
        "annotations": [],
        "transformed": "
            {
              hover:(p6) => {
                console.log('ok')
              },
            }
          ",
      }
    `)
  })

  it('ignore regex', async () => {
    const result = await transform(`
      word.replace(/-(\w)/g)
    `)
    expect(result).toMatchInlineSnapshot(`
      {
        "annotations": [],
        "transformed": "
            word.replace(/-(w)/g)
          ",
      }
    `)
  })
})
