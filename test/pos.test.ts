import { expect, it } from 'vitest'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'
import { createGenerator } from '@unocss/core'
import { getMatchedPositions } from '../packages/plugins-common'

it('getMatchedPositions', async () => {
  const uno = createGenerator({
    presets: [
      presetAttributify({ strict: true }),
      presetUno({ attributifyPseudo: true }),
    ],
  })

  async function match(code: string) {
    const result = await uno.generate(code)
    return getMatchedPositions(code, [...result.matched])
  }

  expect(await match('<div border="b gray4"></div>'))
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
