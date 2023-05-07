import MagicString from 'magic-string'
import type { UnoGenerator } from '@unocss/core'
import type { Processed } from 'svelte/types/compiler/preprocess'
import type { TransformClassesOptions } from '../types'
import { wrapSelectorsWithGlobal } from './wrapGlobal'
import { findClasses } from './findClasses'
import { addGeneratedStylesIntoStyleBlock } from './addGeneratedStyles'
import type { ProcessResult } from './processClasses'
import { processClasses } from './processClasses'

export async function transformClasses({ content, filename, uno, options }: { content: string; filename: string; uno: UnoGenerator; options: TransformClassesOptions }): Promise<Processed | void> {
  const classesToProcess = findClasses(content)
  if (!classesToProcess.length)
    return

  const { rulesToGenerate, codeUpdates } = await processClasses(classesToProcess, options, uno, filename)
  if (!Object.keys(rulesToGenerate).length)
    return

  const { map, code } = updateTemplateCodeIfNeeded(codeUpdates, content, filename)

  const generatedStyles = await generateStyles(rulesToGenerate, uno)
  const codeWithGeneratedStyles = addGeneratedStylesIntoStyleBlock(code, generatedStyles)

  return {
    code: codeWithGeneratedStyles,
    map,
  }
}

function updateTemplateCodeIfNeeded(codeUpdates: ProcessResult['codeUpdate'][], source: string, filename: string) {
  if (!codeUpdates.length)
    return { code: source, map: undefined }

  const s = new MagicString(source)

  for (const { start, end, content } of codeUpdates)
    s.overwrite(start, end, content)

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: filename }),
  }
}

const removeCommentsToMakeGlobalWrappingEasy = true

async function generateStyles(rulesToGenerate: ProcessResult['rulesToGenerate'], uno: UnoGenerator<{}>) {
  const originalShortcuts = uno.config.shortcuts

  const shortcutsForThisComponent = Object.entries(rulesToGenerate)
  uno.config.shortcuts = [...originalShortcuts, ...shortcutsForThisComponent]

  const selectorsToGenerate = Object.keys(rulesToGenerate)
  const { css } = await uno.generate(selectorsToGenerate,
    {
      preflights: false,
      safelist: false,
      minify: removeCommentsToMakeGlobalWrappingEasy,
    })
  uno.config.shortcuts = originalShortcuts

  const cssPreparedForSvelteCompiler = wrapSelectorsWithGlobal(css)
  return cssPreparedForSvelteCompiler
}
