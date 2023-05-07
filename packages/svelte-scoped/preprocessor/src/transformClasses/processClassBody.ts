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

  const { restOfBody, updatedExpressions, rulesToGenerate: rulesFromExpressions, shortcuts: shortcutsFromExpressions } = await processExpressions(expandedBody, options, uno, filename)

  const { rulesToGenerate: normalRules, shortcuts: normalShortcuts, ignore } = await sortClassesIntoCategories(restOfBody, uno, options, filename)

  const rulesToGenerate = { ...rulesFromExpressions, ...normalRules }
  const shortcuts = [...shortcutsFromExpressions, ...normalShortcuts]

  if (!Object.keys(rulesToGenerate).length) {
    if (shortcuts.length)
      return { shortcuts }
    return {}
  }

  const content = Object.keys(normalRules)
    .concat(normalShortcuts)
    .concat(ignore)
    .concat(updatedExpressions)
    .join(' ')

  const codeUpdate: ProcessResult['codeUpdate'] = {
    content,
    start,
    end,
  }

  return { rulesToGenerate, shortcuts, codeUpdate }
}
