import { describe, expect, test } from 'vitest'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator, extractorSplit } from '@unocss/core'
import { getMatchedPositionsFromCode as match } from '@unocss/shared-common'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import cssDirectives from '@unocss/transformer-directives'

import extractorPug from '@unocss/extractor-pug'

describe('matched-positions', async () => {
  test('attributify', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true }),
        presetUno({ attributifyPseudo: true }),
      ],
    })

    expect(await match(uno, '<div border="b gray4 2 [&_span]:white"></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            13,
            14,
            "[border=\\"b\\"]",
          ],
          [
            15,
            20,
            "[border=\\"gray4\\"]",
          ],
          [
            21,
            22,
            "[border=\\"2\\"]",
          ],
          [
            23,
            37,
            "[border=\\"[&_span]:white\\"]",
          ],
        ]
      `)
  })

  test('css-directive', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      transformers: [cssDirectives()],
    })

    expect(await match(uno, '.btn-center{@apply text-center my-0 font-medium;\n}'))
      .toMatchInlineSnapshot(`
        [
          [
            19,
            30,
            "text-center",
          ],
          [
            31,
            35,
            "my-0",
          ],
          [
            36,
            47,
            "font-medium",
          ],
        ]
      `)
  })

  test('class-based', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    expect(await match(uno, '<div class="bg-gray-900 h-4 hover:scale-100"></div>'))
      .toMatchInlineSnapshot(`
      [
        [
          12,
          23,
          "bg-gray-900",
        ],
        [
          24,
          27,
          "h-4",
        ],
        [
          28,
          43,
          "hover:scale-100",
        ],
      ]
    `)
  })

  test('variant-group', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      transformers: [
        transformerVariantGroup(),
      ],
    })

    expect(await match(uno, '<div class="hover:(h-4 w-4 bg-green-300) disabled:opacity-50"></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            19,
            22,
            "hover:h-4",
          ],
          [
            23,
            26,
            "hover:w-4",
          ],
          [
            27,
            39,
            "hover:bg-green-300",
          ],
          [
            41,
            60,
            "disabled:opacity-50",
          ],
        ]
      `)
  })
})

describe('matched-positions-pug', async () => {
  const matchPug = (uno: UnoGenerator, code: string) => {
    return match(uno,
`<template lang='pug'>
  ${code}
</template>`, 'App.vue')
  }

  const uno = createGenerator({
    presets: [
      presetUno(),
      presetAttributify({ strict: true }),
    ],
    extractors: [
      extractorSplit,
      extractorPug(),
    ],
    transformers: [
      transformerVariantGroup(),
    ],
  })
  test('plain class', async () => {
    const pugCode = `div.p1.ma
      div.p2#id1
      div.p4.p5= p6
      div.p7 p8
      div.p9(text=red)
      `
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot(`
        [
          [
            28,
            30,
            "p1",
          ],
          [
            31,
            33,
            "ma",
          ],
          [
            44,
            46,
            "p2",
          ],
          [
            61,
            63,
            "p4",
          ],
          [
            64,
            66,
            "p5",
          ],
          [
            81,
            83,
            "p7",
          ],
          [
            97,
            99,
            "p9",
          ],
        ]
      `)
  }, 20000)

  test('attributify', async () => {
    const pugCode = `div.cls(border="b gray4")
      div(text="red")
      `
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot(`
        [
          [
            40,
            41,
            "[border=\\"b\\"]",
          ],
          [
            42,
            47,
            "[border=\\"gray4\\"]",
          ],
          [
            66,
            69,
            "[text=\\"red\\"]",
          ],
        ]
      `)
  })

  test('variant group: not support in pug', async () => {
    const pugCode = 'div.hover:(h-4 w-4 bg-green-300)'
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot('[]')
  })

  test('css-directive: not support in pug', async () => {
    const pugCode = 'div.btn-center{@apply text-center my-0 font-medium;\n}'
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot('[]')
  })
})

