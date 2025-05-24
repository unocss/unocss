import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import presetWind3 from '@unocss/preset-wind3'
import { describe, expect, it } from 'vitest'

describe('preflights', () => {
  it('basic', async () => {
    const uno = await createGenerator({
      preflights: [
        {
          getCSS() {
            return '.hello { text: red }'
          },
          layer: 'custom',
        },
        {
          getCSS() { return undefined },
          layer: 'void',
        },
        {
          getCSS() { return '.default-preflight {}' },
        },
      ],
      presets: [],
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })

  it('no preflights with preset', async () => {
    const cssArray = [presetMini, presetWind3].map(async (preset) => {
      const uno = await createGenerator({
        presets: [preset({ preflight: false })],
      })
      const { css } = await uno.generate('')
      return css
    })
    expect(await Promise.all(cssArray)).toMatchInlineSnapshot(`
      [
        "",
        "",
      ]
    `)
  })

  it('preflight root can be customized with string', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        preflightRoot: ':root',
      },
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })

  it('preflight root can be customized with array', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        preflightRoot: ['.scope-1', '[data-scope-2]'],
      },
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })

  it('preflight root can be disabled using empty array', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini(),
      ],
      theme: {
        preflightRoot: [],
      },
    })
    const { css } = await uno.generate('')
    expect(css).eql('')
  })

  it('preflight with variablePrefix', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({
          variablePrefix: 'test-',
        }),
      ],
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })

  it('preflight with empty variablePrefix', async () => {
    const uno = await createGenerator({
      presets: [
        presetMini({
          variablePrefix: '',
        }),
      ],
    })
    const { css } = await uno.generate('')
    expect(css).toMatchSnapshot()
  })
})
