import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { ProcessResult } from './processClasses'
import { sortClassesIntoCategories } from './sortClassesIntoCategories'

const expressionsRE = /\S*\{[^{}]+\}\S*/g // { foo ? 'mt-1' : 'mt-2'}, \S* handles expressions as partial class name as in bg-{color}-100
const classesRE = /(?<=\?\s*|:\s*)(["'`])([\s\S]*?)\1/g // 'mt-1 mr-1'

export async function processExpressions(
  body: string,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
) {
  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  const updatedExpressions: string[] = []
  let restOfBody = body

  const expressions = [...body.matchAll(expressionsRE)]
  for (let [expression] of expressions) {
    restOfBody = restOfBody.replace(expression, '').trim()
    const classes = [...expression.matchAll(classesRE)]

    for (const [withQuotes, quoteMark, withoutQuotes] of classes) {
      const { rulesToGenerate: rulesFromExpression, ignore }
        = await sortClassesIntoCategories(withoutQuotes, options, uno, filename)
      Object.assign(rulesToGenerate, rulesFromExpression)

      const updatedClasses = Object.keys(rulesFromExpression)
        .concat(ignore)
        .join(' ')

      expression = expression.replace(
        withQuotes,
        quoteMark + updatedClasses + quoteMark,
      )
    }

    updatedExpressions.push(expression)
  }

  return { rulesToGenerate, updatedExpressions, restOfBody }
}
