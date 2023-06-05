import type { UnoGenerator } from '@unocss/core'
import { expandVariantGroup } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'

import { processExpressions } from './processExpressions'
import { sortClassesIntoCategories } from './sortClassesIntoCategories'

export async function processClassBody(
  { body, start, end }: FoundClass,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
): Promise<Partial<ProcessResult>> {
  const expandedBody = expandVariantGroup(body)

  const { rulesToGenerate: rulesFromExpressions, restOfBody, updatedExpressions } = await processExpressions(expandedBody, options, uno, filename)
  const { rulesToGenerate: rulesFromRegularClasses, ignore } = await sortClassesIntoCategories(restOfBody, options, uno, filename)

  const rulesToGenerate = { ...rulesFromExpressions, ...rulesFromRegularClasses }

  if (!Object.keys(rulesToGenerate).length)
    return {}

  const content = Object.keys(rulesFromRegularClasses)
    .concat(ignore)
    .concat(updatedExpressions)
    .join(' ')

  const codeUpdate: ProcessResult['codeUpdate'] = {
    content,
    start,
    end,
  }

  return { rulesToGenerate, codeUpdate }
}
