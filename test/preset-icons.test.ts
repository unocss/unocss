import { createGenerator } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'

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

  it('fixtures', async () => {
    const { css, layers } = await uno.generate(fixtures.join(' '), { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    await expect(css).toMatchFileSnapshot('./assets/output/preset-icons.css')
  })

  it('icon unit fixtures', async () => {
    const { css, layers } = await unoWithUnit.generate(fixtures.join(' '), { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    await expect(css).toMatchFileSnapshot('./assets/output/preset-icons-unit.css')
  })

  it('svg prologue cleared', async () => {
    const { css, layers } = await unoWithUnit.generate('<button class="i-custom:circle-with-xml-preface" />', { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    expect(css).toContain('data:image/svg+xml;utf8,%3Csvg')
    await expect(css).toMatchFileSnapshot('./assets/output/preset-icons-unit-svg-prologue.css')
  })

  it('custom the usedProps in propsProcessor', async () => {
    const uno = createGenerator({
      presets: [
        presetUno(),
        presetIcons({
          processor(props, { mode }) {
            if (mode === 'bg') {
              delete props.width
              delete props.height
            }
          },
        }),
      ],
    })
    const { css } = await uno.generate(fixtures.join(' '), { preflights: false })
    await expect(css).toMatchFileSnapshot('./assets/output/preset-icons-propsProcessor.css')
  })
})
