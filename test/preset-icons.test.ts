import type { IconsAPI } from '@unocss/preset-icons'
import { createGenerator } from '@unocss/core'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'

describe('preset-icons', async () => {
  const fixtures = [
    '<button class="i-carbon-sun dark:i-carbon-moon" />',
    '<button class="i-carbon-sun?bg dark:i-carbon-moon?bg" />',
    '<button class="i-carbon-sun?bg dark:i-carbon-moon?auto" />',
  ]

  const uno = await createGenerator({
    presets: [
      presetIcons(),
      presetWind3(),
    ],
  })

  const unoWithUnit = await createGenerator({
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
      presetWind3(),
    ],
  })

  it('fixtures', async () => {
    const api = uno.config.presets.find(preset => preset.name === '@unocss/preset-icons')?.api as IconsAPI
    expect((await api.parseIcon('carbon-sun'))?.collection).toBe('carbon')
    expect((await api.parseIcon('carbon:moon'))?.name).toBe('moon')
    const { css, layers } = await uno.generate(fixtures.join(' '), { preflights: false })
    expect(layers).toEqual(['icons', 'default'])
    await expect(css).toMatchFileSnapshot('./assets/output/preset-icons.css')
  })

  it('parses from the current preset options without generation', async () => {
    const uno = await createGenerator({
      presets: [presetIcons({
        collections: {
          custom: {
            star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3 7 7 1z"/></svg>',
          },
        },
      })],
    })
    const api = uno.config.presets.find(preset => preset.name === '@unocss/preset-icons')?.api as IconsAPI
    const first = api.parseIcon('custom-star')
    expect(api.parseIcon('custom-star')).toBe(first)
    expect((await first)?.collection).toBe('custom')
    expect(await api.parseIcon('missing-star')).toBeUndefined()
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
    const uno = await createGenerator({
      presets: [
        presetWind3(),
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

  it('custom without unit', async () => {
    const uno = await createGenerator({
      presets: [
        presetIcons({
          collections: {
            custom: {
              foo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg>`,
              bar: `<svg width='32' height='32' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg>`,
              baz: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg>`,
              qux: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"></svg>`,
            },
          },
          customizations: {
            iconCustomizer(collection, icon, props) {
              if (collection === 'custom' && icon === 'baz') {
                props.width = 'var(--icon-size)'
                props.height = 'var(--icon-size)'
              }
              if (collection === 'custom' && icon === 'qux') {
                props.width = 'auto'
                props.height = 'auto'
              }
            },
          },
        }),
      ],
    })

    const { css } = await uno.generate('i-custom:foo i-custom:bar i-custom:baz i-custom:qux')

    expect(css).toMatchInlineSnapshot(`
      "/* layer: icons */
      .i-custom\\:bar{background:url("data:image/svg+xml;utf8,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3C/svg%3E") no-repeat;background-size:100% 100%;background-color:transparent;width:1em;height:1em;}
      .i-custom\\:baz{background:url("data:image/svg+xml;utf8,%3Csvg width='var(--icon-size)' height='var(--icon-size)' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3C/svg%3E") no-repeat;background-size:100% 100%;background-color:transparent;width:var(--icon-size);height:var(--icon-size);}
      .i-custom\\:foo{background:url("data:image/svg+xml;utf8,%3Csvg width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3C/svg%3E") no-repeat;background-size:100% 100%;background-color:transparent;width:1em;height:1em;}
      .i-custom\\:qux{background:url("data:image/svg+xml;utf8,%3Csvg width='auto' height='auto' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3C/svg%3E") no-repeat;background-size:100% 100%;background-color:transparent;width:auto;height:auto;}"
    `)
  })
})
