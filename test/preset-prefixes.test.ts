import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import presetAttributify from '@unocss/preset-attributify'
import { expect, test } from 'vitest'

const targets = [
  'icon-mdi-alarm',
  '[uno-sm~="bg-blue-400"]',
]

test('options properties does not override each other', async () => {
  const uno1 = createGenerator({
    presets: [
      presetAttributify({ prefix: 'uno-' }),
      presetUno(),
      presetIcons({ prefix: 'icon-' }),
    ],
  })

  const { css: css1 } = await uno1.generate(new Set(targets), { preflights: false })
  expect(css1).toMatchSnapshot()

  const uno2 = createGenerator({
    presets: [
      presetIcons({ prefix: 'icon-' }),
      presetUno(),
      presetAttributify({ prefix: 'uno-' }),
    ],
  })

  const { css: css2 } = await uno2.generate(new Set(targets), { preflights: false })
  expect(css2).toMatchSnapshot()
})
