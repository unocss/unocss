import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'
import { processClassBody } from './processClassBody.js'
import { processDirective } from './processDirective.js'

export async function processClsx(
  cls: FoundClass,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
): Promise<ProcessResult | undefined> {
  if (cls.type === 'clsxObject') {
    // The body might contain multiple rules. Delegate processing.

    const { rulesToGenerate, codeUpdate } = await processClassBody({ ...cls, type: 'regular' }, options, uno, filename)

    if (rulesToGenerate && codeUpdate) {
      // We must wrap the content to update in quotes to get valid property identifiers.
      codeUpdate.content = `"${codeUpdate.content}"`

      return { rulesToGenerate, codeUpdate }
    }
  }
  else if (cls.type === 'clsxObjectShorthand') {
    // The body can only contain a single rule with the same name as the variable.

    const { rulesToGenerate, codeUpdate } = await processDirective({ ...cls, type: 'directive' }, options, uno, filename) ?? {}

    if (rulesToGenerate && codeUpdate) {
      // Overwrite the content to update.
      codeUpdate.content = `"${codeUpdate.content}": ${cls.body}`

      return { rulesToGenerate, codeUpdate }
    }
  }
}
