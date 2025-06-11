import { createGenerator } from '@unocss/core'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import { expect, it } from 'vitest'

const targets = [
  'icon-mdi-alarm',
  '[uno-sm~="bg-blue-400"]',
]

it('options properties does not override each other', async () => {
  const uno1 = await createGenerator({
    presets: [
      presetAttributify({ prefix: 'uno-' }),
      presetWind3(),
      presetIcons({ prefix: 'icon-' }),
    ],
  })

  const { css: css1 } = await uno1.generate(new Set(targets), { preflights: false })

  await expect(css1).toMatchFileSnapshot('./assets/output/preset-prefixes-1.css')

  const uno2 = await createGenerator({
    presets: [
      presetIcons({ prefix: 'icon-' }),
      presetWind3(),
      presetAttributify({ prefix: 'uno-' }),
    ],
  })

  const { css: css2 } = await uno2.generate(new Set(targets), { preflights: false })

  await expect(css2).toMatchFileSnapshot('./assets/output/preset-prefixes-2.css')
})
