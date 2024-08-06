import { describe, expect, it } from 'vitest'
import type { FoundClass } from './findClasses'
import { processDirective } from './processDirective'
import { shortcutName, unoMock } from './unoMock'
import type { ProcessResult } from './processClasses'

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
