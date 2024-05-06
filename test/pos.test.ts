import { describe, expect, it } from 'vitest'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { getMatchedPositionsFromCode as match } from '@unocss/shared-common'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import cssDirectives from '@unocss/transformer-directives'
import extractorPug from '@unocss/extractor-pug'
import { defaultIdeMatchExclude, defaultIdeMatchInclude } from '@unocss/shared-integration'

describe('matched-positions', async () => {
  it('attributify', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true }),
        presetUno({ attributifyPseudo: true }),
      ],
    })

    expect(await match(uno, '<div border="b gray4 2 [&_span]:white" hover="[&>span]:text-white" border></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            13,
            14,
            "[border="b"]",
          ],
          [
            15,
            20,
            "[border="gray4"]",
          ],
          [
            21,
            22,
            "[border="2"]",
          ],
          [
            23,
            37,
            "[border="[&_span]:white"]",
          ],
          [
            46,
            65,
            "[hover="[&>span]:text-white"]",
          ],
          [
            67,
            73,
            "border",
          ],
        ]
      `)
  })

  it('attributify position', async () => {
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
            "[border="bb"]",
          ],
          [
            16,
            17,
            "[border="b"]",
          ],
        ]
      `)
  })

  it('css-directive', async () => {
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

  it('class-based', async () => {
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

  it('arbitrary property', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    expect(await match(uno, '<div class="[color:red] [color:\'red\'] [foo:bar:baz] [content:\'bar:baz\']"></div>'))
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
          [
            52,
            71,
            "[content:'bar:baz']",
          ],
        ]
      `)
  })

  it('variant-group', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
      shortcuts: {
        '<custom-shortcut': 'text-lg',
      },
      transformers: [
        transformerVariantGroup(),
      ],
    })

    expect(await match(uno, '<div class="hover:(h-4 w-4 bg-green-300 <custom-shortcut) disabled:opacity-50"></div>'))
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
            40,
            56,
            "hover:<custom-shortcut",
          ],
          [
            58,
            77,
            "disabled:opacity-50",
          ],
        ]
      `)
  })

  it('colon highlighting #2460', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    expect(await match(uno, 'w5:<div class="w-full"></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            15,
            21,
            "w-full",
          ],
        ]
      `)
  })

  it('with include and exclude', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
      ],
    })

    const code = `
<script setup>
let transition = 'ease-in-out duration-300'
</script>

<template>
  <div class="h-1 text-red" />
</template>

<style>
.css { 
  transform: translateX(0);
  @apply: text-blue;
  --uno:
    text-purple;
}
</style>
    `

    expect(await match(uno, code))
      .toMatchInlineSnapshot(`
        [
          [
            20,
            30,
            "transition",
          ],
          [
            34,
            45,
            "ease-in-out",
          ],
          [
            46,
            58,
            "duration-300",
          ],
          [
            96,
            99,
            "h-1",
          ],
          [
            100,
            108,
            "text-red",
          ],
          [
            144,
            153,
            "transform",
          ],
          [
            180,
            189,
            "text-blue",
          ],
          [
            204,
            215,
            "text-purple",
          ],
        ]
      `)

    expect(await match(uno, code, undefined, { includeRegex: defaultIdeMatchInclude, excludeRegex: defaultIdeMatchExclude }))
      .toMatchInlineSnapshot(`
        [
          [
            34,
            45,
            "ease-in-out",
          ],
          [
            46,
            58,
            "duration-300",
          ],
          [
            96,
            99,
            "h-1",
          ],
          [
            100,
            108,
            "text-red",
          ],
          [
            180,
            189,
            "text-blue",
          ],
          [
            204,
            215,
            "text-purple",
          ],
        ]
      `)
  })

  it('with include and exclude in attributify', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
        presetAttributify(),
      ],
    })

    // #3684, origin HTML tags not include `mt-1`
    expect(await match(uno, '<div class="[&_>*]:w-full" mt-1></div>', '', {
      includeRegex: defaultIdeMatchInclude,
      excludeRegex: defaultIdeMatchExclude,
    }))
      .toMatchInlineSnapshot(`
          [
            [
              12,
              25,
              "[&_>*]:w-full",
            ],
            [
              27,
              31,
              "mt-1",
            ],
          ]
        `)

    // origin HTML tags not include `mr-1 px2`
    expect(await match(uno, `<Tabs
    @edit="(e) => handleEdit()"
    mr-1 px2
    type="editable-card"
    size="small"
    :animated="false"
    :hideAdd="true"
    :tabBarGutter="3"
    :activeKey="activeKeyRef"
    @change="handleChange"
  >`, '', {
      includeRegex: defaultIdeMatchInclude,
      excludeRegex: defaultIdeMatchExclude,
    }))
      .toMatchInlineSnapshot(`
        [
          [
            42,
            46,
            "mr-1",
          ],
          [
            47,
            50,
            "px2",
          ],
        ]
      `)

    // #3733, match php <? stuck
    expect(await match(uno, `<?php
    Route::get('/some-route', [SomeController::class, 'someMethod']);
    Route::get('/some-route', [SomeController::class, 'someMethod']);
    Route::get('/some-route', [SomeController::class, 'someMethod']);
    `, '', {
      includeRegex: defaultIdeMatchInclude,
      excludeRegex: defaultIdeMatchExclude,
    }))
      .toMatchInlineSnapshot(`[]`)
  })
})

describe('matched-positions-pug', async () => {
  const matchPug = (uno: UnoGenerator, code: string) => {
    return match(uno, `<template lang='pug'>
  ${code}
</template>`, 'App.vue')
  }

  const uno = createGenerator({
    presets: [
      presetUno(),
      presetAttributify({ strict: true }),
    ],
    extractors: [
      extractorPug(),
    ],
    transformers: [
      transformerVariantGroup(),
    ],
  })

  it('plain class: normal case', async () => {
    const pugCode = `div.p1.ma
      div.p2#id1
      div.p4.p5= p6
      div.p7 p8
      div.p9(text="red")
      `
    expect(await matchPug(uno, pugCode)).toMatchSnapshot()
  }, 20000)

  it('plain class: prefix', async () => {
    const pugCode = `div(class='hover:scale-100')
    div(class="hover:scale-90")
    div(class="hover:scale-80 p1")
    div(class="hover:scale-70 p2 ")
    div.p3(class="hover:scale-60")
    `
    expect(await matchPug(uno, pugCode)).toMatchSnapshot()
  }, 20000)

  it('attributify', async () => {
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
          "[border="b"]",
        ],
        [
          41,
          46,
          "[border="gray4"]",
        ],
        [
          65,
          68,
          "[text="red"]",
        ],
      ]
    `)
  })

  it('variant group', async () => {
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

  it('attributify `><`', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify(),
        presetUno(),
      ],
      shortcuts: {
        '<custom-shortcut': 'text-teal',
      },
    })

    expect(await match(uno, '<div border></div><div <custom-shortcut></div>'))
      .toMatchInlineSnapshot(`
        [
          [
            5,
            11,
            "border",
          ],
          [
            23,
            39,
            "<custom-shortcut",
          ],
        ]
      `)
  })

  it('@unocss/transformer-directives', async () => {
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
