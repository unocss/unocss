import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { ProcessResult } from './processClasses'
import { sortClassesIntoCategories } from './sortClassesIntoCategories'
import { shortcutName, unoMock } from './unoMock'

const expressionsRE = /{[^{}]+?}/g // { foo ? 'mt-1' : 'mt-2'}
const classesRE = /'([\S\s]+?)'/g // 'mt-1 mr-1'
// Not supporting usage of backticks or double quotes inside inline conditionals /(["'\`])([\S\s]+?)\1/g

export async function processExpressions(body: string, options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string) {
  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  let shortcuts: ProcessResult['shortcuts'] = []
  const updatedExpressions: string[] = []
  let restOfBody = body

  const expressions = [...body.matchAll(expressionsRE)]
  for (let [expression] of expressions) {
    restOfBody = restOfBody.replace(expression, '').trim()
    const classes = [...expression.matchAll(classesRE)]

    for (const [withQuotes, withoutQuotes] of classes) {
      const { rulesToGenerate: rulesFromExpression, shortcuts: shortcutsFromExpression, ignore } = await sortClassesIntoCategories(withoutQuotes, uno, options, filename)
      Object.assign(rulesToGenerate, rulesFromExpression)

      shortcuts = [...shortcuts, ...shortcutsFromExpression]

      const updatedClasses = Object.keys(rulesFromExpression)
        .concat(shortcutsFromExpression)
        .concat(ignore)
        .join(' ')

      expression = expression.replace(withQuotes, `'${updatedClasses}'`)
    }

    updatedExpressions.push(expression)
  }

  return { rulesToGenerate, shortcuts, updatedExpressions, restOfBody }
}

if (import.meta.vitest) {
  describe('processExpressions', () => {
    const body = `font-bold {bar ? 'text-red-600' : 'text-green-600 ${shortcutName} text-lg boo'} underline foo {baz ? 'italic ' : ''}`

    test.only('combined', async () => {
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
            "uno-qqh05x": [
              "text-green-600",
              "text-lg",
            ],
          },
          "shortcuts": [
            "my-shortcut",
          ],
          "updatedExpressions": [
            "{bar ? 'uno-ffvc5a' : 'uno-qqh05x my-shortcut boo'}",
            "{baz ? 'uno-br1nw8' : ''}",
          ],
        }
      `)
    })

    test('uncombined', async () => {
      expect(await processExpressions(body, { combine: false }, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
        {
          "restOfBody": "font-bold  underline foo ",
          "rulesToGenerate": {
            "_italic_7dkb0w": [
              "italic",
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
          "shortcuts": [
            "my-shortcut",
          ],
          "updatedExpressions": [
            "{bar ? '_text-red-600_7dkb0w' : '_text-green-600_7dkb0w _text-lg_7dkb0w my-shortcut boo'}",
            "{baz ? '_italic_7dkb0w' : ''}",
          ],
        }
      `)
    })
  })
}
