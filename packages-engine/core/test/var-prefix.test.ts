import { createGenerator } from '@unocss/core'
import { presetWind4 } from 'unocss/preset-wind4'
import { expect, it } from 'vitest'

it('basic variable prefix', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind4({
        variablePrefix: 'foo-',
        preflights: {
          reset: false,
          theme: false,
          property: true,
        },
      }),
    ],
  })
  const { css } = await uno.generate('bg-white')
  expect(css).toMatchInlineSnapshot(`
    "/* layer: properties */
    @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))){*, ::before, ::after, ::backdrop{--foo-bg-opacity:100%;}}
    @property --foo-bg-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
    /* layer: default */
    .bg-white{background-color:color-mix(in srgb, var(--colors-white) var(--foo-bg-opacity), transparent);}
    @supports (color: color-mix(in lab, red, red)){
    .bg-white{background-color:color-mix(in oklab, var(--colors-white) var(--foo-bg-opacity), transparent);}
    }"
  `)
})
