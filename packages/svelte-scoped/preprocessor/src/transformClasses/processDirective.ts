import type { UnoGenerator } from '@unocss/core'
import type { TransformClassesOptions } from '../types'
import type { FoundClass } from './findClasses'
import { needsGenerated } from './needsGenerated'
import { generateClassName } from './generateClassName'
import type { ProcessResult } from './processClasses'
import { isShortcut } from './isShortcut'

export async function processDirective(
  { body: token, start, end, type }: FoundClass,
  options: TransformClassesOptions,
  uno: UnoGenerator,
  filename: string,
): Promise<Partial<ProcessResult> | undefined> {
  if (isShortcut(token, uno.config.shortcuts))
    return { shortcuts: [token] }

  if (!await needsGenerated(token, uno))
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
  describe('processDirective', () => {
    test('ignores non-utility', async () => {
      const unoMock: UnoGenerator = {
        config: {
          safelist: [],
          shortcuts: [],
        },
        parseToken: async () => undefined,
      }

      const classToIgnore: FoundClass = {
        body: 'foo',
        start: 0,
        end: 3,
        type: 'directive',
      }
      expect(await processDirective(classToIgnore, {}, unoMock, 'Foo.svelte')).toEqual(undefined)
    })

    test('shortcut', async () => {
      const unoMock: UnoGenerator = {
        config: {
          safelist: [],
          shortcuts: [{ 0: 'foo' }],
        },
        parseToken: async () => undefined,
      }

      const shortcut: FoundClass = {
        body: 'foo',
        start: 0,
        end: 3,
        type: 'directive',
      }
      expect(await processDirective(shortcut, {}, unoMock, 'Foo.svelte')).toEqual({ shortcuts: ['foo'] })
    })

    test('handles directive', async () => {
      const unoMock: UnoGenerator = {
        config: {
          safelist: [],
          shortcuts: [],
        },
        parseToken: async () => [{ 0: '', 1: ['mb-1'] }],
      }

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
