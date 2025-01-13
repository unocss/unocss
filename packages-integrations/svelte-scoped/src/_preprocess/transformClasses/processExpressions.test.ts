import { describe, expect, it } from 'vitest'
import { processExpressions } from './processExpressions'
import { shortcutName, unoMock } from './unoMock'

describe('processExpressions', () => {
  describe('everything', () => {
    const body = `font-bold {bar ? 'text-red-600' : 'text-green-600 ${shortcutName} text-lg boo'} underline foo {baz ? 'italic ' : ''}`

    it('combined', async () => {
      expect(await processExpressions(body, {}, unoMock, 'Foo.svelte'))
        .toMatchInlineSnapshot(`
        {
          "restOfBody": "font-bold  underline foo",
          "rulesToGenerate": {
            "uno-br1nw8": [
              "italic",
            ],
            "uno-ffvc5a": [
              "text-red-600",
            ],
            "uno-oaete6": [
              "text-green-600",
              "my-shortcut",
              "text-lg",
            ],
          },
          "updatedExpressions": [
            "{bar ? 'uno-ffvc5a' : 'uno-oaete6 boo'}",
            "{baz ? 'uno-br1nw8' : ''}",
          ],
        }
      `)
    })

    it('uncombined', async () => {
      expect(
        await processExpressions(
          body,
          { combine: false },
          unoMock,
          'Foo.svelte',
        ),
      ).toMatchInlineSnapshot(`
        {
          "restOfBody": "font-bold  underline foo",
          "rulesToGenerate": {
            "_italic_7dkb0w": [
              "italic",
            ],
            "_my-shortcut_7dkb0w": [
              "my-shortcut",
            ],
            "_text-green-600_7dkb0w": [
              "text-green-600",
            ],
            "_text-lg_7dkb0w": [
              "text-lg",
            ],
            "_text-red-600_7dkb0w": [
              "text-red-600",
            ],
          },
          "updatedExpressions": [
            "{bar ? '_text-red-600_7dkb0w' : '_text-green-600_7dkb0w _my-shortcut_7dkb0w _text-lg_7dkb0w boo'}",
            "{baz ? '_italic_7dkb0w' : ''}",
          ],
        }
      `)
    })
  })

  it('handles expression as only part of a class', async () => {
    const body = 'mr-1 pr{os}e bg-{color}'
    expect(await processExpressions(body, {}, unoMock, 'Foo.svelte'))
      .toMatchInlineSnapshot(`
        {
          "restOfBody": "mr-1",
          "rulesToGenerate": {},
          "updatedExpressions": [
            "pr{os}e",
            "bg-{color}",
          ],
        }
      `)
  })

  it('handles empty string in expression', async () => {
    const body = 'font-bold {grid ? \'\' : \'mr-1\'}'
    expect(await processExpressions(body, {}, unoMock, 'Foo.svelte'))
      .toMatchInlineSnapshot(`
        {
          "restOfBody": "font-bold",
          "rulesToGenerate": {
            "uno-76ckap": [
              "mr-1",
            ],
          },
          "updatedExpressions": [
            "{grid ? '' : 'uno-76ckap'}",
          ],
        }
      `)
  })

  it('ignores ternary condition', async () => {
    const body
      = `{variant === 'outline' ? 'text-red-600' : 'text-green-600'}`
    expect(await processExpressions(body, {}, unoMock, 'Foo.svelte'))
      .toMatchInlineSnapshot(`
        {
          "restOfBody": "",
          "rulesToGenerate": {
            "uno-7bxjda": [
              "text-green-600",
            ],
            "uno-ffvc5a": [
              "text-red-600",
            ],
          },
          "updatedExpressions": [
            "{variant === 'outline' ? 'uno-ffvc5a' : 'uno-7bxjda'}",
          ],
        }
      `)
  })

  it('handles multiple nested ternary expressions', async () => {
    const body = `font-bold {variant === 'outline' ? 'text-red-600' : variant === 'default' ? 'italic ' : 'text-green-600 ${shortcutName} text-lg boo'} underline foo`
    expect(await processExpressions(body, {}, unoMock, 'Foo.svelte'))
      .toMatchInlineSnapshot(`
        {
          "restOfBody": "font-bold  underline foo",
          "rulesToGenerate": {
            "uno-br1nw8": [
              "italic",
            ],
            "uno-ffvc5a": [
              "text-red-600",
            ],
            "uno-oaete6": [
              "text-green-600",
              "my-shortcut",
              "text-lg",
            ],
          },
          "updatedExpressions": [
            "{variant === 'outline' ? 'uno-ffvc5a' : variant === 'default' ? 'uno-br1nw8' : 'uno-oaete6 boo'}",
          ],
        }
      `)
  })
})
