import { expect, test } from 'vitest'
import { createGenerator } from '@unocss/core'
import { variantPseudoClassesAndElements } from './pseudo'

test('pseudo variant order', async () => {
  const uno = createGenerator({
    variants: [
      variantPseudoClassesAndElements(),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
    mergeSelectors: false,
  })

  const result = await uno.generate([
    'foo-1',
    'hover:foo-2',
    'disabled:foo-3',
  ])

  expect(result.css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .foo-1{text:foo-1;}
      .hover\\\\:foo-2:hover{text:foo-2;}
      .disabled\\\\:foo-3:disabled{text:foo-3;}"
    `)
})
