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

  const unoWithUnit = createGenerator({
    presets: [
      presetIcons({
        unit: 'rem',
        scale: 2,
        collections: {
          custom: {
            'circle-with-xml-preface': `
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="50"/></svg>
`,
          },
        },
        customizations: {
          iconCustomizer(collection, icon, props) {
            if (!(collection === 'carbon' && icon === 'sun')) {
              props.width = '1em'
              props.height = '1em'
            }
          },
        },
      }),
      presetUno(),
    ],
  })

  test('fixtures', async () => {
    const { css, layers } = await uno.generate(fixtures.join(' '), { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })

  test('icon unit fixtures', async () => {
    const { css, layers } = await unoWithUnit.generate(fixtures.join(' '), { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toMatchSnapshot()
  })
  test('svg prologue cleared', async () => {
    const { css, layers } = await unoWithUnit.generate('<button class="i-custom:circle-with-xml-preface" />', { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toContain('data:image/svg+xml;utf8,%3Csvg')
    expect(css).toMatchSnapshot()
  })
})
