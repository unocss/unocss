import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import { processDirective } from './processDirective'
import { processClassBody } from './processClassBody'

export interface ProcessResult {
  rulesToGenerate: RuleToStylesMap
  codeUpdate: CodeUpdate
  shortcuts: string[]
}

interface ProcessResults extends Omit<ProcessResult, 'codeUpdate'> {
  codeUpdates: CodeUpdate[]
}

interface CodeUpdate {
  start: number
  end: number
  content: string
}

type RuleToStylesMap = Record<string, string[]>

export async function processClasses(classes: FoundClass[], options: TransformClassesOptions, uno: UnoGenerator, filename: string): Promise<ProcessResults> {
  const result: ProcessResults = {
    rulesToGenerate: {},
    codeUpdates: [],
    shortcuts: [],
  }

  for (const foundClass of classes) {
    if (foundClass.type === 'regular') {
      const { rulesToGenerate, codeUpdate, shortcuts } = await processClassBody(foundClass, options, uno, filename)

      if (rulesToGenerate)
        Object.assign(result.rulesToGenerate, rulesToGenerate)

      if (codeUpdate)
        result.codeUpdates.push(codeUpdate)

      if (shortcuts)
        result.shortcuts = [...result.shortcuts, ...shortcuts]
    }
    else {
      const { rulesToGenerate, codeUpdate, shortcuts } = await processDirective(foundClass, options, uno, filename) || {}

      if (rulesToGenerate)
        Object.assign(result.rulesToGenerate, rulesToGenerate)

      if (codeUpdate)
        result.codeUpdates.push(codeUpdate)

      if (shortcuts)
        result.shortcuts = [...result.shortcuts, ...shortcuts]
    }
  }

  return result
}
