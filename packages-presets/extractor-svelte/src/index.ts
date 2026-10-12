import type { Extractor } from '@unocss/core'
import { extractUnquotedClasses } from './extract-unquoted-classes'

const rightTrimRe = /=$/

function extractorSvelte(): Extractor {
  return {
    name: 'svelte',
    order: 100,
    extract({ code, id, extracted }) {
      if (id && id.endsWith('.svelte')) {
        const items = Array.from(extracted)
        items.forEach((r) => {
          if (r.startsWith('class:')) {
            extracted.add(r.slice(6).replace(rightTrimRe, ''))
            extracted.delete(r)
          }
        })
        for (const value of extractUnquotedClasses(code))
          extracted.add(value)
      }
    },
  }
}

export default extractorSvelte
