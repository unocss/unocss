import { createGenerator } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'
import { expect, it } from 'vitest'

export const fixture = new Set([
  'pl-10px',
  'hover:p-4',
  '!p-5px',
  '!hover:px-10',
  'hover:!p-10',
  'flex',
  'dark:text-xl',
  'dark:hover:text-xl',
  'sm:text-red-100',
  'sm:text-red-200/10',
  'md:!hidden',
  'scope-[.variant]:c-red',
])

const uno = await createGenerator({
  presets: [
    presetWind3(),
  ],
})

it('scope', async () => {
  const { css } = await uno.generate(fixture, { scope: '.foo-scope', preflights: false })
  expect(css).toMatchSnapshot()
})

it('scope with property layer', async () => {
  const uno = await createGenerator({
    presets: [
      presetWind4(),
    ],
  })
  const { css } = await uno.generate('text-red', { scope: '.foo-scope', preflights: false })
  expect(css).toMatchInlineSnapshot(`
    "/* layer: properties */
    @property --un-text-opacity{syntax:"<percentage>";inherits:false;initial-value:100%;}
    /* layer: default */
    .foo-scope .text-red{color:color-mix(in srgb, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent);}
    @supports (color: color-mix(in lab, red, red)){
    .foo-scope .text-red{color:color-mix(in oklab, var(--colors-red-DEFAULT) var(--un-text-opacity), transparent);}
    }"
  `)
})
