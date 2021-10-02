import { MiniwindExtractor } from '../../../types'

export const extractorSplit: MiniwindExtractor = code => new Set(code.split(/[\s'"`;]/g))
