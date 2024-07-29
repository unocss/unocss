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
