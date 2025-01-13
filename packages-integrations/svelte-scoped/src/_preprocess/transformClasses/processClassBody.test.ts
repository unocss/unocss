import type { TransformClassesOptions } from '../types'
import type { ProcessResult } from './processClasses'
import { describe, expect, it } from 'vitest'
import { processClassBody } from './processClassBody'
import { shortcutName, unoMock } from './unoMock'

describe('processClassBody', () => {
  function process(body: string, options: TransformClassesOptions = {}) {
    return processClassBody({ body, start: 0, end: body.length, type: 'regular' }, options, unoMock, 'Foo.svelte')
  }

  describe('handles two utility classes and an unknown', () => {
    const two_utilties_and_unknown = 'mb-1 mr-1 foo'

    it('when uncombined', async () => {
      const expected: Partial<ProcessResult> = {
        rulesToGenerate: {
          '_mb-1_7dkb0w': ['mb-1'],
          '_mr-1_7dkb0w': ['mr-1'],
        },
        codeUpdate: {
          content: '_mb-1_7dkb0w _mr-1_7dkb0w foo',
          start: 0,
          end: 13,
        },
      }

      expect(await process(two_utilties_and_unknown, { combine: false })).toEqual(expected)
    })

    it('when combined', async () => {
      const expected: Partial<ProcessResult> = {
        rulesToGenerate: {
          'uno-07jvco': ['mb-1', 'mr-1'],
        },
        codeUpdate: {
          content: 'uno-07jvco foo',
          start: 0,
          end: 13,
        },
      }

      expect(await process(two_utilties_and_unknown)).toEqual(expected)
    })

    it('with extra spaces and unknown class in middle', async () => {
      const reordered = 'mb-1   foo mr-1'
      const result1 = (await process(two_utilties_and_unknown, { combine: false })!).codeUpdate!.content
      const result2 = (await process(reordered, { combine: false })!).codeUpdate!.content
      expect(result1).toEqual(result2)
    })
  })

  it('returns empty object if only finds unknown classes', async () => {
    const unknownClasses = 'foo bar'
    expect(await process(unknownClasses)).toEqual({})
  })

  it('shortcut', async () => {
    expect((await process(shortcutName))!.rulesToGenerate).toEqual({ 'uno-jryqbp': [shortcutName] })
  })

  it('expression', async () => {
    const body = 'mr-1 foo {variable ? \'mb-1\' : \'baz\'}'
    expect((await process(body))!.codeUpdate!.content).toMatchInlineSnapshot('"uno-76ckap foo {variable ? \'uno-2se4c1\' : \'baz\'}"')
  })
})
