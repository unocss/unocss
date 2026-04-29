import type { UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'
import type { TransformClassesOptions } from '../../types'
import type { ProcessResult } from './processClasses'
import { findClasses } from './findClasses'
import { processClasses } from './processClasses'

export async function transformClasses({ s, filename, uno, options, removeCommentsToMakeGlobalWrappingEasy }: {
  s: MagicString
  filename: string
  uno: UnoGenerator
  options: TransformClassesOptions
  removeCommentsToMakeGlobalWrappingEasy: boolean
}): Promise<{ generatedStyles: string } | void> {
  const classesToProcess = findClasses(s.original)
  if (!classesToProcess.length)
    return

  const { rulesToGenerate, codeUpdates } = await processClasses(classesToProcess, options, uno, filename)
  if (!Object.keys(rulesToGenerate).length)
    return

  if (codeUpdates.length) {
    for (const { start, end, content } of codeUpdates)
      s.overwrite(start, end, content)
  }

  const generatedStyles = await generateStyles(rulesToGenerate, uno, removeCommentsToMakeGlobalWrappingEasy)

  return {
    generatedStyles,
  }
}

async function generateStyles(rulesToGenerate: ProcessResult['rulesToGenerate'], uno: UnoGenerator<object>, minify: boolean) {
  const shortcutsForThisComponent = Object.entries(rulesToGenerate)
  uno.config.shortcuts.push(...shortcutsForThisComponent)

  const selectorsToGenerate = Object.keys(rulesToGenerate)
  const { css } = await uno.generate(selectorsToGenerate, {
    preflights: false,
    safelist: false,
    minify,
  })

  return css
}
