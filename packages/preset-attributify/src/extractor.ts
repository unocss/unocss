import { Extractor, isValidSelector } from '@unocss/core'
import { AttributifyOptions } from '.'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

const splitterRE = /[\s'"`;]/g
const valuedAttributeRE = /([\w:-]+)(?:=(["'])([^\2]+?)\2)?/g

export const extractorAttributify = (options?: AttributifyOptions): Extractor => (code) => {
  const result = Array.from(code.matchAll(valuedAttributeRE))
    .flatMap(([, name, _, content]) => {
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
}
