import type { Extractor } from '@unocss/core'
import type { TagifyOptions } from './types'

export const MARKER = '__TAGIFY__'
export const htmlTagRE = /<([\w\d-:]+)/g

export const extractorTagify = (options: TagifyOptions): Extractor => {
  const {
    prefix = '',
    excludedTags = ['b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table'],
  } = options

  return {
    name: 'tagify',
    extract({ code }) {
      return new Set(
        Array.from(code.matchAll(htmlTagRE))
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

            return true
          })
          .filter(({ 1: match }) => match.startsWith(prefix))
          .map(([, matched]) => `${MARKER}${matched}`),
      )
    },
  }
}
