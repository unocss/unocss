import { describe, expect, it } from 'vitest'
import { processExpressions } from './processExpressions'
import { shortcutName, unoMock } from './unoMock'

describe('processExpressions', () => {
  describe('everything', () => {
    const body = `font-bold {bar ? 'text-red-600' : 'text-green-600 ${shortcutName} text-lg boo'} underline foo {baz ? 'italic ' : ''}`

    it('combined', async () => {
      expect(await processExpressions(body, {}, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
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
      expect(await processExpressions(body, { combine: false }, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
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
    expect(await processExpressions(body, {}, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
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
    expect(await processExpressions(body, {}, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
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
})
