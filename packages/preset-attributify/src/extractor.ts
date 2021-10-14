import { Extractor, isValidSelector } from '@unocss/core'
import { AttributifyOptions } from '.'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

const splitterRE = /[\s'"`;]/g
const valuedAttributeRE = /([\w:-]+)=(["'])([^\2]+?)\2/g
const htmlStartingTagRE = /<[\w-]+?\s([\s\S]+?)>/g
const nonValuedAttributeRE = /(?<=\s|^)([\w.:\[\]\-]+?)(?=[\s\n]|$)/g

export const extractorAttributify = (options?: AttributifyOptions): Extractor => (code) => {
  const result = Array.from(code.matchAll(valuedAttributeRE))
    .flatMap(([, name, _, content = '']) => {
      for (const prefix of strippedPrefixes) {
        if (name.startsWith(prefix)) {
          name = name.slice(prefix.length)
          break
        }
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
