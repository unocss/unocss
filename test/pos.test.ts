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

  test('attributify position', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true }),
        presetUno({ attributifyPseudo: true }),
      ],
      theme: {
        colors: {
          bb: 'black',
        },
      },
    })

    expect(await match(uno, '<div border="bb b"></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            13,
            15,
            "[border=\\"bb\\"]",
          ],
          [
            16,
            17,
            "[border=\\"b\\"]",
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
      shortcuts: {
        '<custom-shortcut': 'text-lg',
      },
    })

    expect(await match(uno, '<div class="bg-gray-900 h-4 hover:scale-100 [&>span]:text-white <custom-shortcut"></div>'))
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
          [
            44,
            63,
            "[&>span]:text-white",
          ],
          [
            64,
            80,
            "<custom-shortcut",
          ],
        ]
      `)
  })

  test('arbitrary property', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    expect(await match(uno, '<div class="[color:red] [color:\'red\']"></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            12,
            23,
            "[color:red]",
          ],
          [
            24,
            37,
            "[color:'red']",
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

  test('plain class: normal case', async () => {
    const pugCode = `div.p1.ma
      div.p2#id1
      div.p4.p5= p6
      div.p7 p8
      div.p9(text="red")
      `
    expect(await matchPug(uno, pugCode)).toMatchSnapshot()
  }, 20000)

  test('plain class: prefix', async () => {
    const pugCode = `div(class='hover:scale-100')
    div(class="hover:scale-90")
    div(class="hover:scale-80 p1")
    div(class="hover:scale-70 p2 ")
    div.p3(class="hover:scale-60")
    `
    expect(await matchPug(uno, pugCode)).toMatchSnapshot()
  }, 20000)

  test('attributify', async () => {
    const pugCode = `div.p4(border="b gray4")
      div(text='red')
      `
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot(`
      [
        [
          28,
          30,
          "p4",
        ],
        [
          39,
          40,
          "b",
        ],
        [
          39,
          40,
          "[border=\\"b\\"]",
        ],
        [
          41,
          46,
          "[border=\\"gray4\\"]",
        ],
        [
          65,
          68,
          "[text=\\"red\\"]",
        ],
      ]
    `)
  })

  test('variant group', async () => {
    const pugCode = 'div.p4(class="hover:(h-4 w-4)")'
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot(`
      [
        [
          28,
          30,
          "p4",
        ],
        [
          45,
          48,
          "hover:h-4",
        ],
        [
          49,
          52,
          "hover:w-4",
        ],
      ]
    `)
  })

  test('@unocss/transformer-directives', async () => {
    // \n could not be include
    // div.p2(class="btn-center{@apply p1 m1;\n}") -> pug parse error
    const pugCode = 'div.p2(class="btn-center{@apply p1 m1;}")'
    expect(await matchPug(uno, pugCode)).toMatchInlineSnapshot(`
      [
        [
          28,
          30,
          "p2",
        ],
        [
          56,
          58,
          "p1",
        ],
        [
          59,
          61,
          "m1",
        ],
      ]
    `)
  })
})
