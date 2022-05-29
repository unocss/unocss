import type { Extractor } from '@unocss/core'
import type { TagifyOptions } from './types'

export const MARKER = '__TAGIFY__'
export const htmlTagRE = /<([\w\d-:]+)/g

export const extractorTagify = (options: TagifyOptions): Extractor => {
  const {
    prefix = '',
  } = options

  return {
    name: 'tagify',
    extract({ code }) {
      return new Set(
        Array.from(code.matchAll(htmlTagRE))
          .filter(({ 1: match }) => match.startsWith(prefix))
          .map(([, matched]) => `${MARKER}${matched}`),
      )
    },
  }
}
