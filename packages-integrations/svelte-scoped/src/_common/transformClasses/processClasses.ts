import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import { processClassBody } from './processClassBody'
import { processClsx } from './processClsx.js'
import { processDirective } from './processDirective'

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
    const { rulesToGenerate, codeUpdate } = await processClass(foundClass, options, uno, filename)

    if (rulesToGenerate)
      Object.assign(result.rulesToGenerate, rulesToGenerate)

    if (codeUpdate)
      result.codeUpdates.push(codeUpdate)
  }

  return result
}

async function processClass(foundClass: FoundClass, options: TransformClassesOptions, uno: UnoGenerator, filename: string): Promise<Partial<ProcessResult>> {
  if (foundClass.type === 'regular') {
    return await processClassBody(foundClass, options, uno, filename)
  }

  if (foundClass.type === 'clsxObject' || foundClass.type === 'clsxObjectShorthand') {
    return await processClsx(foundClass, options, uno, filename) ?? {}
  }

  return await processDirective(foundClass, options, uno, filename) ?? {}
}
