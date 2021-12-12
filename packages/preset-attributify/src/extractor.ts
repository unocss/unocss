import type { Extractor } from '@unocss/core'
import { isValidSelector } from '@unocss/core'
import type { AttributifyOptions } from '.'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

const splitterRE = /[\s'"`;]+/g
const elementRE = /<\w[\w:\.$-]*\s((?:'[\s\S]*?'|"[\s\S]*?"|`[\s\S]*?`|\{[\s\S]*?\}|[\s\S]*?)*?)>/g
const valuedAttributeRE = /([?]|(?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:%-]+)(?:=(["'])([^\2]*?)\2)?/g

export const extractorAttributify = (options?: AttributifyOptions): Extractor => ({
  name: 'attributify',
  extract({ code }) {
    const result = Array.from(code.matchAll(elementRE))
      .flatMap(match => Array.from((match[1] || '').matchAll(valuedAttributeRE)))
      .flatMap(([, name, _, content]) => {
        if (options?.ignoreAttributes?.includes(name))
          return []

        for (const prefix of strippedPrefixes) {
          if (name.startsWith(prefix)) {
            name = name.slice(prefix.length)
            break
          }
        }

        if (!content) {
          if (isValidSelector(name) && options?.nonValuedAttribute !== false)
            return [`[${name}=""]`]
          return []
        }

        if (['class', 'className'].includes(name)) {
          return content
            .split(splitterRE)
            .filter(isValidSelector)
        }
        else {
          return content
            .split(splitterRE)
            .filter(Boolean)
            .map(v => `[${name}~="${v}"]`)
        }
      })

    return new Set(result)
  },
})
