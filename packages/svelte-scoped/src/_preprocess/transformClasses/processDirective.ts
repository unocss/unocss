import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import { needsGenerated } from './needsGenerated'
import { generateClassName } from './generateClassName'
import type { ProcessResult } from './processClasses'
import { isShortcut } from './isShortcut'
import { shortcutName, unoMock } from './unoMock'

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

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe('processDirective', () => {
    it('ignores non-utility', async () => {
      const classToIgnore: FoundClass = {
        body: 'foo',
        start: 0,
        end: 3,
        type: 'directive',
      }
      expect(await processDirective(classToIgnore, {}, unoMock, 'Foo.svelte')).toEqual(undefined)
    })

    it('shortcut', async () => {
      const shortcut: FoundClass = {
        body: shortcutName,
        start: 0,
        end: 3,
        type: 'directive',
      }
      expect((await processDirective(shortcut, {}, unoMock, 'Foo.svelte'))!.rulesToGenerate).toEqual({ 'uno-jryqbp': [shortcutName] })
    })

    it('handles directive', async () => {
      const foundClass: FoundClass = {
        body: 'mb-1',
        start: 13,
        end: 17,
        type: 'directive',
      }

      const expected: Partial<ProcessResult> = {
        rulesToGenerate: {
          'uno-2se4c1': ['mb-1'],
        },
        codeUpdate: {
          content: 'uno-2se4c1',
          start: 13,
          end: 17,
        },
      }

      expect(await processDirective(foundClass, {}, unoMock, 'Foo.svelte')).toEqual(expected)
    })
  })
}
