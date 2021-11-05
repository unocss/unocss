import { StringifiedUtil, ParsedUtil, RawUtil, Variant, VariantObject } from '../types'

export const attributifyRE = /^\[(.+?)~?="(.*)"\]$/
export const validateFilterRE = /[a-z?]/

export function isAttributifySelector(selector: string) {
  return selector.match(attributifyRE)
}

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

export function normalizeVariant(variant: Variant): VariantObject {
  return typeof variant === 'function'
    ? { match: variant }
    : variant
}

export function isRawUtil(util: ParsedUtil | RawUtil | StringifiedUtil): util is RawUtil {
  return util.length === 3
}
