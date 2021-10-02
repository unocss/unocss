import { MiniwindExtractor } from '../../../types'

export const validateFilterRE = /[a-z]/

export const extractorSplit: MiniwindExtractor = code => new Set(code.split(/[\s'"`;]/g).filter(i => validateFilterRE.test(i)))
