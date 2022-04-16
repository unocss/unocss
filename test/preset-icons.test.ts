import { createGenerator } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import { describe, expect, test } from 'vitest'

describe('preset-icons', () => {
  const fixture1 = `
<button class="i-carbon-sun dark:i-carbon-moon" />
`
  const fixture2 = `
<button class="i-carbon-sun?bg dark:i-carbon-moon?bg" />
`
  const fixture3 = `
<button class="i-carbon-sun?bg dark:i-carbon-moon?auto" />
`

  const uno = createGenerator({
    presets: [
      presetIcons(),
      presetUno(),
    ],
  })

  test('fixture1', async() => {
    const { css, layers } = await uno.generate(fixture1)
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })
  test('fixture2', async() => {
    const { css, layers } = await uno.generate(fixture2)
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })
  test('fixture3', async() => {
    const { css, layers } = await uno.generate(fixture3)
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })
})
