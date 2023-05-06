import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { ProcessResult } from './processClasses'
import { sortClassesIntoCategories } from './processClassBody'
import { shortcutName, unoMock } from './unoMock'

const inlineConditionalsRE = /{[^{}]+?}/g // { foo ? 'mt-1' : 'mt-2'}
const classesRE = /'([\S\s]+?)'/g // 'mt-1 mr-1'
// Not supporting usage of backticks or double quotes inside inline conditionals /(["'\`])([\S\s]+?)\1/g

export async function processInlineConditionals(body: string, options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string) {
  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  let shortcuts: ProcessResult['shortcuts'] = []
  const updatedInlineConditionals: string[] = []
  let restOfBody = body

  const inlineConditionals = [...body.matchAll(inlineConditionalsRE)]
  for (let [conditional] of inlineConditionals) {
    restOfBody = restOfBody.replace(conditional, '')
    const classes = [...conditional.matchAll(classesRE)]

    for (const [withQuotes, withoutQuotes] of classes) {
      const { rulesToGenerate: rules, shortcuts: shortcutsFromThisConditional, ignore } = await sortClassesIntoCategories(withoutQuotes, uno, options, filename)
      Object.assign(rulesToGenerate, rules)

      shortcuts = [...shortcuts, ...shortcutsFromThisConditional]

      const updatedClasses = Object.keys(rules)
        .concat(shortcutsFromThisConditional)
        .concat(ignore)
        .join(' ')

      conditional = conditional.replace(withQuotes, `'${updatedClasses}'`)
    }

    updatedInlineConditionals.push(conditional)
  }

  return { rulesToGenerate, shortcuts, updatedInlineConditionals, restOfBody }
}

if (import.meta.vitest) {
  describe('processInlineConditionals', () => {
    const body = `font-bold {bar ? 'text-red-600' : 'text-green-600 ${shortcutName} text-lg boo'} underline foo {baz ? 'italic ' : ''}`

    test.only('combined', async () => {
      expect(await processInlineConditionals(body, {}, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
        {
          "restOfBody": "font-bold  underline foo ",
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
          "updatedInlineConditionals": [
            "{bar ? 'uno-ffvc5a' : 'uno-qqh05x my-shortcut boo'}",
            "{baz ? 'uno-br1nw8' : ''}",
          ],
        }
      `)
    })

    test('uncombined', async () => {
      expect(await processInlineConditionals(body, { combine: false }, unoMock, 'Foo.svelte')).toMatchInlineSnapshot(`
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
          "updatedInlineConditionals": [
            "{bar ? '_text-red-600_7dkb0w' : '_text-green-600_7dkb0w _text-lg_7dkb0w my-shortcut boo'}",
            "{baz ? '_italic_7dkb0w' : ''}",
          ],
        }
      `)
    })
  })
}
