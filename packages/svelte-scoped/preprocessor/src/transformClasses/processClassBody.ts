import type { UnoGenerator } from '@unocss/core'
import { expandVariantGroup } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'
import { isShortcut } from './isShortcut'
import { needsGenerated } from './needsGenerated'
import { generateClassName } from './generateClassName'
import { processInlineConditionals } from './inlineConditionals'

export async function processClassBody(
  { body, start, end }: FoundClass,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
): Promise<Partial<ProcessResult>> {
  const expandedBody = expandVariantGroup(body)

  const { restOfBody, updatedInlineConditionals, rulesToGenerate: conditionalsRules, shortcuts: conditionalsShortcuts } = await processInlineConditionals(expandedBody, options, uno, filename)

  const { rulesToGenerate: normalRules, shortcuts: normalShortcuts, ignore } = await sortClassesIntoCategories(restOfBody, uno, options, filename)

  const rulesToGenerate = { ...conditionalsRules, ...normalRules }
  const shortcuts = [...conditionalsShortcuts, ...normalShortcuts]

  if (!Object.keys(rulesToGenerate).length) {
    if (shortcuts.length)
      return { shortcuts }
    return {}
  }

  const content = Object.keys(normalRules)
    .concat(normalShortcuts)
    .concat(ignore)
    .concat(updatedInlineConditionals)
    .join(' ')

  const codeUpdate: ProcessResult['codeUpdate'] = {
    content,
    start,
    end,
  }

  return { rulesToGenerate, shortcuts, codeUpdate }
}

export async function sortClassesIntoCategories(body: string, uno: UnoGenerator<{}>, options: TransformClassesOptions, filename: string) {
  const { combine = true } = options

  const rulesToGenerate: ProcessResult['rulesToGenerate'] = {}
  const shortcuts: ProcessResult['shortcuts'] = []
  const ignore: string[] = []

  const classes = body.trim().split(/\s+/)
  const knownClassesToCombine: string[] = []

  for (const token of classes) {
    if (isShortcut(token, uno.config.shortcuts)) {
      shortcuts.push(token)
      continue
    }

    if (!await needsGenerated(token, uno)) {
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

  return { rulesToGenerate, shortcuts, ignore }
}
