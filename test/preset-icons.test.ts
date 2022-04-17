import { createGenerator } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'

describe('preset-icons', () => {
  const fixtures = [
    '<button class="i-carbon-sun dark:i-carbon-moon" />',
    '<button class="i-carbon-sun?bg dark:i-carbon-moon?bg" />',
    '<button class="i-carbon-sun?bg dark:i-carbon-moon?auto" />',
  ]

  const uno = createGenerator({
    presets: [
      presetIcons(),
      presetUno(),
    ],
  })

  test('fixtures', async() => {
    const { css, layers } = await uno.generate(fixtures.join(' '))
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })
})
