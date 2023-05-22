import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import { isShortcut } from './isShortcut'
import { needsGenerated } from './needsGenerated'
import { generateClassName } from './generateClassName'
import type { ProcessResult } from './processClasses'

export async function sortClassesIntoCategories(body: string, options: TransformClassesOptions, uno: UnoGenerator<{}>, filename: string) {
  const { combine = true } = options

  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  const ignore: string[] = []

  const classes = body.trim().split(/\s+/)
  const knownClassesToCombine: string[] = []

  for (const token of classes) {
    const isShortcutOrUtility = isShortcut(token, uno.config.shortcuts) || await needsGenerated(token, uno)

    if (!isShortcutOrUtility) {
      ignore.push(token)
      continue
    }

    if (combine) {
      knownClassesToCombine.push(token)
    }
    else {
      const generatedClassName = generateClassName(token, options, filename)
      rulesToGenerate[generatedClassName] = [token]
    }
  }

  if (knownClassesToCombine.length) {
    const generatedClassName = generateClassName(knownClassesToCombine.join(' '), options, filename)
    rulesToGenerate[generatedClassName] = knownClassesToCombine
  }

  return { rulesToGenerate, ignore }
}
