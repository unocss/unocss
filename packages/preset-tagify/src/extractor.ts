import type { Extractor } from '@unocss/core'
import type { TagifyOptions } from './types'

export const MARKER = '__TAGIFY__'
export const htmlTagRE = /<([\w:-]+)/g

export function extractorTagify(options: TagifyOptions): Extractor {
  const {
    prefix = '',
    excludedTags = ['b', /^h\d+$/, 'table'],
  } = options

  return {
    name: 'tagify',
    extract({ code }) {
      return Array.from(code.matchAll(htmlTagRE))
        .filter(({ 1: match }) => {
          for (const exclude of excludedTags) {
            if (typeof exclude === 'string') {
              if (match === exclude)
                return false
            }
            else {
              if (exclude.test(match))
                return false
            }
          }
          return match.startsWith(prefix)
        })
        .map(([, matched]) => `${MARKER}${matched}`)
    },
  }
}
