import * as acorn from 'acorn'
import { walk } from 'zimmerframe'

export interface FoundClass {
  body: string
  start: number
  end: number
  type: ClassForms
}

type ClassForms = 'regular' | 'directive' | 'directiveShorthand' | 'clsxObject' | 'clsxObjectShorthand'

const classesRE = /class=(["'`])([\s\S]*?)\1/g // class="mb-1"
const classDirectivesRE = /class:(\S+?)="?\{/g // class:mb-1={foo} and class:mb-1="{foo}"
const classDirectivesShorthandRE = /class:([^=>\s/]+)[{>\s/]/g // class:logo (compiled to class:uno-1hashz={logo})
const classClsxRE = /(?<prefix>class=\{\w*)[[{(]/g // class={[...]}, class={{...}} and class={clsx(...)} (in fact any function call)

export function findClasses(code: string) {
  const matchedClasses = [...code.matchAll(classesRE)]
  const matchedClassDirectives = [...code.matchAll(classDirectivesRE)]
  const matchedClassDirectivesShorthand = [...code.matchAll(classDirectivesShorthandRE)]
  const matchedClassClsx = [...code.matchAll(classClsxRE)]

  const classes = parseMatches(matchedClasses, 'regular', 'class="'.length)
  const classDirectives = parseMatches(matchedClassDirectives, 'directive', 'class:'.length)
  const classDirectivesShorthand = parseMatches(matchedClassDirectivesShorthand, 'directiveShorthand', 'class:'.length)
  const classClsx = parseMatchesWithAcorn(matchedClassClsx, code)

  return [...classes, ...classDirectives, ...classDirectivesShorthand, ...classClsx]
}

function parseMatches(matches: RegExpMatchArray[], type: ClassForms, prefixLength: number) {
  return matches.map((match): FoundClass => {
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

function parseMatchesWithAcorn(matches: RegExpMatchArray[], code: string) {
  return matches.flatMap((match): FoundClass[] => {
    const start = match.index! + match.groups!.prefix.length

    const ast = acorn.parseExpressionAt(code, start, {
      sourceType: 'module',
      ecmaVersion: 16,
      locations: true,
    })

    const classes: FoundClass[] = []

    function fromProperty(body: string, node: acorn.AnyNode, property: acorn.Property | acorn.AssignmentProperty): FoundClass {
      return {
        body,
        start: node.start,
        end: node.end,
        type: property.shorthand ? 'clsxObjectShorthand' : 'clsxObject',
      }
    }

    function fromString(body: string, node: acorn.AnyNode): FoundClass {
      return {
        body,
        start: node.start + 1,
        end: node.end - 1,
        type: 'regular',
      }
    }

    walk(
      ast as acorn.AnyNode,
      { property: undefined as acorn.Property | acorn.AssignmentProperty | undefined },
      {
        Property(node, { visit }) {
          visit(node.key, { property: node })
        },

        Identifier(node, { state, next }) {
          if (state.property) {
            classes.push(fromProperty(node.name, node, state.property))
          }

          next()
        },

        Literal(node, { state, next }) {
          if (typeof node.value === 'string') {
            const body = node.value

            if (state.property) {
              classes.push(fromProperty(body, node, state.property))
            }
            else {
              classes.push(fromString(body, node))
            }
          }

          next()
        },

        TemplateLiteral(node, { state, next }) {
          if (node.expressions.length === 0 && node.quasis.length === 1) {
            const body = node.quasis[0].value.raw

            if (state.property) {
              classes.push(fromProperty(body, node, state.property))
            }
            else {
              classes.push(fromString(body, node))
            }
          }

          next()
        },
      },
    )

    return classes
  }).filter(hasBody)
}
