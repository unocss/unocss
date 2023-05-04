import type { Extractor } from '@unocss/core'
import { isValidSelector } from '@unocss/core'
import type { AttributifyOptions } from '.'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

const splitterRE = /[\s'"`;]+/g
const elementRE = /<[^>\s]*\s((?:'.*?'|".*?"|`.*?`|\{.*?\}|[^>]*?)*)/g
const valuedAttributeRE = /([?]|(?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:!%-.~<]+)=?(?:["]([^"]*)["]|[']([^']*)[']|[{]([^}]*)[}])?/gms

export const defaultIgnoreAttributes = ['placeholder', 'fill', 'opacity']

export function extractorAttributify(options?: AttributifyOptions): Extractor {
  const ignoreAttributes = options?.ignoreAttributes ?? defaultIgnoreAttributes
  const nonValuedAttribute = options?.nonValuedAttribute ?? true
  const trueToNonValued = options?.trueToNonValued ?? false

  return {
    name: '@unocss/preset-attributify/extractor',
    extract({ code }) {
      const result = Array.from(code.matchAll(elementRE))
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
          else {
            if (options?.prefixedOnly && options.prefix && !name.startsWith(options.prefix))
              return []

            return content.split(splitterRE)
              .filter(v => Boolean(v) && v !== ':')
              .map(v => `[${name}~="${v}"]`)
          }
        })

      return new Set(result)
    },
  }
}
