import type { Extractor } from '@unocss/core'

export const MARKER = '__TAGIFY__'
export const htmlTagRE = /<([\w\d-]+)/g

export const extractorTagify = (): Extractor => {
  return {
    name: 'tagify',
    extract({ code }) {
      return new Set(
        Array.from(code.matchAll(htmlTagRE))
          ?.map(([, matched]) => `${MARKER}${matched}`),
      )
    },
  }
}
