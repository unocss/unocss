import type { Extractor } from '../types'
import { isValidSelector } from '../utils'

export const splitCode = (code: string) => {
  const spliteArray = code.split(/\\?[\s'"`;={}]+/g).filter(isValidSelector)
  const result: string[] = []
  spliteArray.forEach((s) => {
    if (s.endsWith('/>') && s.length !== 2)
      result.push(s.substring(0, s.length - 2), '/>')
    else if (s.endsWith('>') && s.length !== 1)
      result.push(s.substring(0, s.length - 1), '>')
    else
      result.push(s)
  })
  return result
}

export const extractorSplit: Extractor = {
  name: 'split',
  order: 0,
  extract({ code }) {
    return new Set(splitCode(code))
  },
}
