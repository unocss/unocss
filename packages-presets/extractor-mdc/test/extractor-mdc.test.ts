import { createGenerator } from '@unocss/core'
import { expect, it } from 'vitest'
import extractorMdc from '../src/index'

it('extractorMdc', async () => {
  const uno = await createGenerator({
    extractors: [
      extractorMdc(),
    ],
  })

  async function extract(code: string) {
    return Array.from(await uno.applyExtractors(code, 'file.mdc'))
  }

  expect(await extract(`
# Hello{.text-red.foo}

Foo{.text-green.bg-red:10.hover:border-red/10} Bar{class="text-blue"}
`))
    .toMatchInlineSnapshot(`
      [
        "",
        "#",
        "Hello",
        ".text-red.foo",
        "Foo",
        ".text-green.bg-red:10.hover:border-red/10",
        "Bar",
        "class=",
        "text-blue",
        "text-red",
        "foo",
        "text-green",
        "bg-red:10",
        "hover:border-red/10",
      ]
    `)
})
