import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'
import { describe, expect, it } from 'vitest'
import { processClsx } from './processClsx'
import { shortcutName, unoMock } from './unoMock'

describe(processClsx, () => {
  it('ignores non-utility', async () => {
    const classToIgnore: FoundClass = {
      body: 'foo',
      start: 0,
      end: 3,
      type: 'clsxObject',
    }
    expect(await processClsx(classToIgnore, {}, unoMock, 'Foo.svelte')).toEqual(undefined)
  })

  it('handles shortcut', async () => {
    const shortcut: FoundClass = {
      body: shortcutName,
      start: 0,
      end: 3,
      type: 'clsxObject',
    }
    expect((await processClsx(shortcut, {}, unoMock, 'Foo.svelte'))!.rulesToGenerate).toEqual({ 'uno-jryqbp': [shortcutName] })
  })

  it('handles rule', async () => {
    const foundClass: FoundClass = {
      body: 'mb-1',
      start: 13,
      end: 17,
      type: 'clsxObject',
    }

    const expected: Partial<ProcessResult> = {
      rulesToGenerate: {
        'uno-2se4c1': ['mb-1'],
      },
      codeUpdate: {
        content: '"uno-2se4c1"',
        start: 13,
        end: 17,
      },
    }

    expect(await processClsx(foundClass, {}, unoMock, 'Foo.svelte')).toEqual(expected)
  })

  it('handles shorthand rule', async () => {
    const foundClass: FoundClass = {
      body: 'italic',
      start: 13,
      end: 17,
      type: 'clsxObjectShorthand',
    }

    const expected: Partial<ProcessResult> = {
      rulesToGenerate: {
        'uno-br1nw8': ['italic'],
      },
      codeUpdate: {
        content: '"uno-br1nw8": italic',
        start: 13,
        end: 17,
      },
    }

    expect(await processClsx(foundClass, {}, unoMock, 'Foo.svelte')).toEqual(expected)
  })
})
