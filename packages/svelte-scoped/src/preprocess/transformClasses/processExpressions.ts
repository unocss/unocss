import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { ProcessResult } from './processClasses'
import { sortClassesIntoCategories } from './sortClassesIntoCategories'
import { shortcutName, unoMock } from './unoMock'

const expressionsRE = /{[^{}]+?}/g // { foo ? 'mt-1' : 'mt-2'}
const classesRE = /(["'\`])([\S\s]+?)\1/g // 'mt-1 mr-1'

export async function processExpressions(body: string, options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string) {
  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  const updatedExpressions: string[] = []
  let restOfBody = body

  const expressions = [...body.matchAll(expressionsRE)]
  for (let [expression] of expressions) {
    restOfBody = restOfBody.replace(expression, '').trim()
    const classes = [...expression.matchAll(classesRE)]

    for (const [withQuotes, quoteMark, withoutQuotes] of classes) {
      const { rulesToGenerate: rulesFromExpression, ignore } = await sortClassesIntoCategories(withoutQuotes, options, uno, filename)
      Object.assign(rulesToGenerate, rulesFromExpression)

      const updatedClasses = Object.keys(rulesFromExpression)
        .concat(ignore)
        .join(' ')

      expression = expression.replace(withQuotes, quoteMark + updatedClasses + quoteMark)
    }

    updatedExpressions.push(expression)
  }

  return { rulesToGenerate, updatedExpressions, restOfBody }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('processExpressions', () => {
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
}
