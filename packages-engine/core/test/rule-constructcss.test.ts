import { createGenerator } from '@unocss/core'
import { presetWind4 } from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'

// Regression test for https://github.com/unocss/unocss/issues/5351
describe('constructCSS scope placeholder', async () => {
  const uno = await createGenerator({
    presets: [presetWind4()],
    rules: [
      [
        /^foo$/,
        (_match, { constructCSS }) => {
          return constructCSS({ color: 'red' })
        },
      ],
    ],
  })

  it('expands the $$ placeholder left by prefix-based variants', async () => {
    const { css } = await uno.generate('dark:foo dark:@hover:foo', { preflights: false })
    expect(css).not.toContain('$$')
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .dark .dark\\:foo{color:red;}
      @media (hover: hover) and (pointer: fine){.dark .dark\\:\\@hover\\:foo:hover{color:red;}}"
    `)
  })
})
