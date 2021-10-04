import { Extractor, isValidSelector } from '@unocss/core'
import { AttributifyOptions } from '.'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

const valuedAttributeRE = /([\w:-]+)=(["'])([^\2]+?)\2/g
const htmlStartingTagRE = /<[\w-]+?\s([\s\S]+?)>\n/g
const nonValuedAttributeRE = /[\s]([\w.:\[\]\-]+?)[\s]/g

export const extractorAttributify = (options?: AttributifyOptions): Extractor => (code) => {
  const result = Array.from(code.matchAll(valuedAttributeRE))
    .flatMap(([, name, _, content = '']) => {
      for (const prefix of strippedPrefixes) {
        if (name.startsWith(prefix)) {
          name = name.slice(prefix.length)
          break
        }
      }
      return content
        .split(/[\s'"`;]/g)
        .filter(Boolean)
        .map(v => `[${name}~="${v}"]`)
    })

  if (options?.nonValuedAttribute !== false) {
    Array.from(code.matchAll(htmlStartingTagRE))
      .forEach(([, attrs]) => {
        attrs = attrs.replace(htmlStartingTagRE, '')
        result.push(
          ...Array.from(attrs.matchAll(nonValuedAttributeRE))
            .map(([, i]) => i)
            .filter(isValidSelector)
            .map(i => `[${i}=""]`),
        )
      })
  }

  return new Set(result)
}
