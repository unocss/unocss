import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'

it('rule-css-value-input', async () => {
  const uno = await createGenerator({
    rules: [
      ['static-rule', [
        { color: 'red' },
        { 'background-color': 'blue' },
        'css raw string',
      ]],
    ],
  })
  const { css } = await uno.generate('static-rule')
  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .static-rule{background-color:blue;}
    .static-rule{color:red;}
    css raw string"
  `)
})
