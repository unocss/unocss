import { expect, test } from 'vitest'
import { createGenerator } from '@unocss/core'
import { grids } from './grid'

test('grid template arbitrary values', async () => {
  const uno = createGenerator({ rules: grids })
  const css = await uno.generate('grid-cols-[200px,minmax(900px,1fr),auto]').then(r => r.css)

  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .grid-cols-\\\\[200px\\\\,minmax\\\\(900px\\\\,1fr\\\\)\\\\,auto\\\\]{grid-template-columns:200px minmax(900px,1fr) auto;}"
  `)
})
