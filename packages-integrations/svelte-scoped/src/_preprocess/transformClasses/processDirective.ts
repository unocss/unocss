import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'
import { generateClassName } from './generateClassName'
import { isShortcut } from './isShortcut'
import { needsGenerated } from './needsGenerated'

export async function processDirective(
  { body: token, start, end, type }: FoundClass,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
): Promise<Partial<ProcessResult> | undefined> {
  const isShortcutOrUtility = isShortcut(token, uno.config.shortcuts) || await needsGenerated(token, uno)
  if (!isShortcutOrUtility)
    return

  const generatedClassName = generateClassName(token, options, filename)

  const content = type === 'directiveShorthand'
    ? `${generatedClassName}={${token}}`
    : generatedClassName

  return {
    rulesToGenerate: { [generatedClassName]: [token] },
    codeUpdate: { content, start, end },
  }
}
