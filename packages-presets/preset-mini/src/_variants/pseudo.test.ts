import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'
import { variantTaggedPseudoClasses } from './pseudo'

it('nested named groups containing hyphens', async () => {
  const uno = await createGenerator({
    variants: [
      ...variantTaggedPseudoClasses(),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const result = await uno.generate([
    'group-hover/named:foo-1',
    'group-hover/named-group:foo-2',
  ])

  expect(result.matched)
    .toMatchInlineSnapshot(`
      Set {
        "group-hover/named:foo-1",
        "group-hover/named-group:foo-2",
      }
    `)

  expect(result.css).toMatchInlineSnapshot(`
    "/* layer: default */
    .group\\/named-group:hover .group-hover\\/named-group\\:foo-2{text:foo-2;}
    .group\\/named:hover .group-hover\\/named\\:foo-1{text:foo-1;}"
  `)
})
