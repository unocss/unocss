import { Extractor } from '../types'
import { isValidSelector } from '../utils'

export const extractorSplit: Extractor = code => new Set(code.split(/[\s'"`;>=]+/g).filter(isValidSelector))
