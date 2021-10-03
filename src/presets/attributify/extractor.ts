import { Extractor } from '../../types'

const strippedPrefixes = [
  'v-bind:',
  ':',
]

export const extractorAttributify: Extractor = (code) => {
  return new Set(
    Array.from(code.matchAll(/([\w:-]+)=(["'])([^\2]+?)\2/g))
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
      }),
  )
}
