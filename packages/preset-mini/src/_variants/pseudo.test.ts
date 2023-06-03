import { expect, test } from 'vitest'
import { createGenerator } from '@unocss/core'
import { variantPseudoClassesAndElements } from './pseudo'

// https://github.com/unocss/unocss/issues/2713
test('pseudo variant order', async () => {
  const uno = createGenerator({
    variants: [
      variantPseudoClassesAndElements(),
    ],
    rules: [
      [/^foo-(\d)$/, ([_, a]) => ({ text: `foo-${a}` })],
    ],
  })

  const css = await uno.generate([
    'foo-1',
    'hover:foo-2',
    'disabled:foo-3',
  ]).then(r => r.css)

  expect(css.indexOf('foo-1')).toBeLessThan(css.indexOf('foo-2'))
  expect(css.indexOf('foo-2')).toBeLessThan(css.indexOf('foo-3'))
  expect(css)
    .toMatchInlineSnapshot(`
      "/* layer: default */
      .foo-1{text:foo-1;}
      .hover\\\\:foo-2:hover{text:foo-2;}
      .disabled\\\\:foo-3:disabled{text:foo-3;}"
    `)
})
