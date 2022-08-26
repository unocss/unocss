import { describe, expect, test } from 'vitest'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { createGenerator, UnoGenerator } from '@unocss/core'
import { getMatchedPositions } from '@unocss/shared-common'
import { transformerVariantGroup } from "unocss";

describe('matched-positions', async () => {
  async function match(code: string, uno: UnoGenerator) {
    const result = await uno.generate(code, { preflights: false })
    console.log(result);    
    return getMatchedPositions(code, [...result.matched])
  }

  test('attributify', async () => {
    const uno = createGenerator({
      presets: [
        presetAttributify({ strict: true }),
        presetUno({ attributifyPseudo: true }),
      ],
    })
  
    expect(await match('<div border="b gray4"></div>', uno))
      .toMatchInlineSnapshot(`
        [
          [
            15,
            20,
            "[border=\\"gray4\\"]",
          ],
          [
            13,
            14,
            "[border=\\"b\\"]",
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

    expect(await match('<div class="bg-gray-900 h-4 hover:scale-100"></div>', uno))
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
        transformerVariantGroup()
      ]
    })

    expect(await match('<div class="hover:(h-4 w-4 bg-green-300) disabled:opacity-50"></div>', uno))
      .toMatchInlineSnapshot(`
      [
        [
          19,
          22,
          "h-4",
        ],
        [
          23,
          26,
          "w-4",
        ],
        [
          27,
          39,
          "bg-green-300",
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

