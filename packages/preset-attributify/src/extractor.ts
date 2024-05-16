import type { Extractor, ExtractorContext } from '@unocss/core'
import { isValidSelector } from '@unocss/core'
import type { AttributifyOptions } from '.'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

const splitterRE = /[\s'"`;]+/g
// eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-dupe-disjunctions
const elementRE = /<[^>\s]*\s((?:'[^']*'|"[^"]*"|`[^`]*`|\{[^}]*\}|=>|[^>]*?)*)/g
const valuedAttributeRE = /(\?|(?!\d|-{2}|-\d)[\w\u00A0-\uFFFF:!%.~<-]+)=?(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})?/g

export const defaultIgnoreAttributes = ['placeholder', 'fill', 'opacity', 'stroke-opacity']

export function extractorAttributify(options?: AttributifyOptions): Extractor {
  const ignoreAttributes = options?.ignoreAttributes ?? defaultIgnoreAttributes
  const nonValuedAttribute = options?.nonValuedAttribute ?? true
  const trueToNonValued = options?.trueToNonValued ?? false

  return {
    name: '@unocss/preset-attributify/extractor',
    extract({ code }) {
      return Array.from(code.matchAll(elementRE))
        .flatMap(match => Array.from((match[1] || '').matchAll(valuedAttributeRE)))
        .flatMap(([, name, ...contents]) => {
          const content = contents.filter(Boolean).join('')

          if (ignoreAttributes.includes(name))
            return []

          for (const prefix of strippedPrefixes) {
            if (name.startsWith(prefix)) {
              name = name.slice(prefix.length)
              break
            }
          }

          if (!content) {
            if (isValidSelector(name) && nonValuedAttribute !== false) {
              const result = [`[${name}=""]`]
              if (trueToNonValued)
                result.push(`[${name}="true"]`)
              return result
            }
            return []
          }

          if (['class', 'className'].includes(name)) {
            return content
              .split(splitterRE)
              .filter(isValidSelector)
          }
          else if (elementRE.test(content)) {
            elementRE.lastIndex = 0
            return this.extract!({ code: content } as ExtractorContext) as string[]
          }
          else {
            if (options?.prefixedOnly && options.prefix && !name.startsWith(options.prefix))
              return []

            return content.split(splitterRE)
              .filter(v => Boolean(v) && v !== ':')
              .map(v => `[${name}~="${v}"]`)
          }
        })
    },
  }
}
