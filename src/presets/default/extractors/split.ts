import { Extractor } from '../../../types'

export const validateFilterRE = /[a-z]/

export const extractorSplit: Extractor = code => new Set(code.split(/[\s'"`;]/g).filter(i => validateFilterRE.test(i)))
