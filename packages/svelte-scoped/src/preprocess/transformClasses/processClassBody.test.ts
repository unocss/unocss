import { describe, expect, it } from 'vitest'
import type { FoundClass } from './findClasses'
import type { ProcessResult } from './processClasses'
import { processClassBody } from './processClassBody'
import { shortcutName, unoMock } from './unoMock'

describe('processClassBody', () => {
  describe('handles two simples classes and an unknown', () => {
    const foundClass: FoundClass = {
      body: 'mb-1 mr-1 foo',
      start: 13,
      end: 17,
      type: 'regular',
    }

    it('uncombined', async () => {
      const expected: Partial<ProcessResult> = {
        rulesToGenerate: {
          '_mb-1_7dkb0w': ['mb-1'],
          '_mr-1_7dkb0w': ['mr-1'],
        },
        codeUpdate: {
          content: '_mb-1_7dkb0w _mr-1_7dkb0w foo',
          start: 13,
          end: 17,
        },
      }

      expect(await processClassBody(foundClass, { combine: false }, unoMock, 'Foo.svelte')).toEqual(expected)
    })

    it('combined', async () => {
      const expected: Partial<ProcessResult> = {
        rulesToGenerate: {
          'uno-07jvco': ['mb-1', 'mr-1'],
        },
        codeUpdate: {
          content: 'uno-07jvco foo',
          start: 13,
          end: 17,
        },
      }

      expect(await processClassBody(foundClass, { combine: true }, unoMock, 'Foo.svelte')).toEqual(expected)
    })

    it('extra spaces and unknown class in middle', async () => {
      const reorderedClass = {
        ...foundClass,
        body: 'mb-1   foo mr-1',
      }
      const result1 = await processClassBody(foundClass, { combine: false }, unoMock, 'Foo.svelte')
      const result2 = await processClassBody(reorderedClass, { combine: false }, unoMock, 'Foo.svelte')
      expect(result1).toEqual(result2)
    })
  })

  it('returns empty object if only finds unknown classes', async () => {
    const classToIgnore: FoundClass = {
      body: 'foo bar',
      start: 0,
      end: 3,
      type: 'regular',
    }
    expect(await processClassBody(classToIgnore, {}, unoMock, 'Foo.svelte')).toEqual({})
  })

  it('shortcut', async () => {
    const shortcut: FoundClass = {
      body: shortcutName,
      start: 0,
      end: 3,
      type: 'regular',
    }
    expect((await processClassBody(shortcut, {}, unoMock, 'Foo.svelte'))!.rulesToGenerate).toEqual({ 'uno-jryqbp': [shortcutName] })
  })
})
