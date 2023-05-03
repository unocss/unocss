interface FoundClass {
  body: string
  start: number
  end: number
}

const classesRE = /class=(["'\`])([\S\s]*?)\1/g // class="mb-1"
const classDirectivesRE = /class:([\S]+?)={/g // class:mb-1={foo}
const classDirectivesShorthandRE = /class:([^=>\s/]+)[{>\s/]/g // class:logo (compiled to class:uno-1hashz={logo})

export function findClasses(code: string) {
  const matchedClasses = [...code.matchAll(classesRE)]
  const matchedClassDirectives = [...code.matchAll(classDirectivesRE)]
  const matchedClassDirectivesShorthand = [...code.matchAll(classDirectivesShorthandRE)]

  const classes = parseMatches(matchedClasses, 2, 'class="'.length)
  const classDirectives = parseMatches(matchedClassDirectives, 1, 'class:'.length)
  const classDirectivesShorthand = parseMatches(matchedClassDirectivesShorthand, 1, 'class:'.length)

  return { classes, classDirectives, classDirectivesShorthand }
}

function parseMatches(matches: RegExpMatchArray[], bodyCapturingGroup: number, prefixLength: number) {
  return matches.map((match) => {
    const body = match[bodyCapturingGroup]
    const start = match.index! + prefixLength
    return {
      body: body.trim(),
      start,
      end: start + body.length,
    }
  }).filter(hasBody)
}

function hasBody(foundClass: FoundClass) {
  return foundClass.body
}

if (import.meta.vitest) {
  describe('findClasses', () => {
    it('returns body, start, and end for basic class', () => {
      const code = '<span class="mb-1 pr-2 " />'
      const result = findClasses(code).classes
      const expected: FoundClass[] = [
        {
          body: 'mb-1 pr-2',
          start: 13,
          end: 23,
        },
      ]
      expect(result).toEqual(expected)
    })

    it('ignores empty classes', () => {
      const code = '<div class="" /><div class="mb-1" />'
      const result = findClasses(code).classes
      const expected: FoundClass[] = [
        {
          body: 'mb-1',
          start: 28,
          end: 32,
        },
      ]
      expect(result).toEqual(expected)
    })

    it('classDirectives', () => {
      const code = '<span class:mb-1={foo} />'
      const result = findClasses(code).classDirectives
      const expected: FoundClass[] = [
        {
          body: 'mb-1',
          start: 12,
          end: 16,
        },
      ]
      expect(result).toEqual(expected)
    })

    it('classDirectivesShorthand', () => {
      const code = '<span class:logo />'
      const result = findClasses(code).classDirectivesShorthand
      const expected: FoundClass[] = [
        {
          body: 'logo',
          start: 12,
          end: 16,
        },
      ]
      expect(result).toEqual(expected)
    })
  })
}
