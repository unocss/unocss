import type { UnoGenerator } from '@unocss/core'
import { expandVariantGroup } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'
import { isShortcut } from './isShortcut'
import { needsGenerated } from './needsGenerated'
import { generateClassName } from './generateClassName'

export async function processClassBody(
  { body, start, end }: FoundClass,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
): Promise<Partial<ProcessResult>> {
  const { combine = true } = options

  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  const shortcuts: ProcessResult['shortcuts'] = []
  const unknown: string[] = []

  const expandedBody = expandVariantGroup(body)

  // TODO: process inline conditionals and return rulesToGenerate, shortcuts, and place the whole resulting chunk of text into unknown - then split what's leftover into classes and process those

  const classes = expandedBody.split(/\s+/)
  const knownClassesToCompileTogether: string[] = []

  for (const token of classes) {
    if (isShortcut(token, uno.config.shortcuts)) {
      shortcuts.push(token)
      continue
    }

    if (!await needsGenerated(token, uno)) {
      unknown.push(token)
      continue
    }

    if (combine) {
      knownClassesToCompileTogether.push(token)
    }
    else {
      const generatedClassName = generateClassName(token, options, filename)
      rulesToGenerate[generatedClassName] = [token]
    }
  }

  if (knownClassesToCompileTogether.length) {
    const generatedClassName = generateClassName(knownClassesToCompileTogether.join(' '), options, filename)
    rulesToGenerate[generatedClassName] = knownClassesToCompileTogether
  }

  if (!Object.keys(rulesToGenerate).length) {
    if (shortcuts.length)
      return { shortcuts }
    return {}
  }

  const content = Object.keys(rulesToGenerate).concat(shortcuts).concat(unknown).join(' ')
  const codeUpdate: ProcessResult['codeUpdate'] = {
    content,
    start,
    end,
  }

  return { rulesToGenerate, shortcuts, codeUpdate }
}
