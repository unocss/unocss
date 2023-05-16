import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import { processDirective } from './processDirective'
import { processClassBody } from './processClassBody'

export interface ProcessResult {
  rulesToGenerate: RuleToStylesMap
  codeUpdate: CodeUpdate
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
  }

  for (const foundClass of classes) {
    if (foundClass.type === 'regular') {
      const { rulesToGenerate, codeUpdate } = await processClassBody(foundClass, options, uno, filename)

      if (rulesToGenerate)
        Object.assign(result.rulesToGenerate, rulesToGenerate)

      if (codeUpdate)
        result.codeUpdates.push(codeUpdate)
    }
    else {
      const { rulesToGenerate, codeUpdate } = await processDirective(foundClass, options, uno, filename) || {}

      if (rulesToGenerate)
        Object.assign(result.rulesToGenerate, rulesToGenerate)

      if (codeUpdate)
        result.codeUpdates.push(codeUpdate)
    }
  }

  return result
}
