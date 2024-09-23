import type { UnoGenerator } from '@unocss/core'
import type { Processed } from 'svelte/types/compiler/preprocess'
import type { TransformClassesOptions } from '../types'
import type { ProcessResult } from './processClasses'
import MagicString from 'magic-string'
import { addGeneratedStylesIntoStyleBlock } from './addGeneratedStyles'
import { findClasses } from './findClasses'
import { processClasses } from './processClasses'
import { wrapSelectorsWithGlobal } from './wrapGlobal'

export async function transformClasses({ content, filename, uno, options }: { content: string, filename: string, uno: UnoGenerator, options: TransformClassesOptions }): Promise<Processed | void> {
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

const REMOVE_COMMENTS_TO_MAKE_GLOBAL_WRAPPING_EASY = true

async function generateStyles(rulesToGenerate: ProcessResult['rulesToGenerate'], uno: UnoGenerator<object>) {
  const shortcutsForThisComponent = Object.entries(rulesToGenerate)
  uno.config.shortcuts.push(...shortcutsForThisComponent)

  const selectorsToGenerate = Object.keys(rulesToGenerate)
  const { css } = await uno.generate(selectorsToGenerate, {
    preflights: false,
    safelist: false,
    minify: REMOVE_COMMENTS_TO_MAKE_GLOBAL_WRAPPING_EASY,
  })

  const cssPreparedForSvelteCompiler = wrapSelectorsWithGlobal(css)
  return cssPreparedForSvelteCompiler
}
