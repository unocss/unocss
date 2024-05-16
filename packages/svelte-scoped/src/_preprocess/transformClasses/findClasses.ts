export interface FoundClass {
  body: string
  start: number
  end: number
  type: ClassForms
}

type ClassForms = 'regular' | 'directive' | 'directiveShorthand'

const classesRE = /class=(["'`])([\s\S]*?)\1/g // class="mb-1"
const classDirectivesRE = /class:(\S+?)="?\{/g // class:mb-1={foo} and class:mb-1="{foo}"
const classDirectivesShorthandRE = /class:([^=>\s/]+)[{>\s/]/g // class:logo (compiled to class:uno-1hashz={logo})

export function findClasses(code: string) {
  const matchedClasses = [...code.matchAll(classesRE)]
  const matchedClassDirectives = [...code.matchAll(classDirectivesRE)]
  const matchedClassDirectivesShorthand = [...code.matchAll(classDirectivesShorthandRE)]

  const classes = parseMatches(matchedClasses, 'regular', 'class="'.length)
  const classDirectives = parseMatches(matchedClassDirectives, 'directive', 'class:'.length)
  const classDirectivesShorthand = parseMatches(matchedClassDirectivesShorthand, 'directiveShorthand', 'class:'.length)

  return [...classes, ...classDirectives, ...classDirectivesShorthand]
}

function parseMatches(matches: RegExpMatchArray[], type: ClassForms, prefixLength: number) {
  return matches.map((match) => {
    const body = match[type === 'regular' ? 2 : 1]
    const start = match.index! + prefixLength
    return {
      body: body.trim(),
      start,
      end: start + body.length,
      type,
    }
  }).filter(hasBody)
}

function hasBody(foundClass: FoundClass) {
  return foundClass.body
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest

  describe(findClasses, () => {
    it('returns body, start, and end for basic class', () => {
      const code = '<span class="mb-1 pr-2 " />'
      const result = findClasses(code)
      const expected: FoundClass[] = [
        {
          body: 'mb-1 pr-2',
          start: 13,
          end: 23,
          type: 'regular',
        },
      ]
      expect(result).toEqual(expected)
    })

    it('ignores empty classes', () => {
      const code = '<div class="" /><div class="mb-1" />'
      const result = findClasses(code)
      const expected: FoundClass[] = [
        {
          body: 'mb-1',
          start: 28,
          end: 32,
          type: 'regular',
        },
      ]
      expect(result).toEqual(expected)
    })

    it('finds class directives', () => {
      const code = '<span class:mb-1={foo} />'
      const result = findClasses(code)
      const expected: FoundClass[] = [
        {
          body: 'mb-1',
          start: 12,
          end: 16,
          type: 'directive',
        },
      ]
      expect(result).toEqual(expected)
    })

    it('finds class directives in quotes', () => {
      const code = '<span class:mb-1="{foo}" />'
      const result = findClasses(code)
      const expected: FoundClass[] = [
        {
          body: 'mb-1',
          start: 12,
          end: 16,
          type: 'directive',
        },
      ]
      expect(result).toEqual(expected)
    })

    it('finds shorthand class directives', () => {
      const code = '<span class:logo />'
      const result = findClasses(code)
      const expected: FoundClass[] = [
        {
          body: 'logo',
          start: 12,
          end: 16,
          type: 'directiveShorthand',
        },
      ]
      expect(result).toEqual(expected)
    })
  })
}
