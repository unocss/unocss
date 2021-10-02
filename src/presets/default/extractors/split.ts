import { NanowindExtractor } from '../../../types'

export const extractorSplit: NanowindExtractor = code => new Set(code.split(/[\s'"`;]/g))
