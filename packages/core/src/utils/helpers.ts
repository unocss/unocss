import type { ParsedUtil, RawUtil, StringifiedUtil, Variant, VariantObject } from '../types'

export const attributifyRE = /^\[(.+?)~?="(.*)"\]$/
export const validateFilterRE = /(?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:%-?]/

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

export function notNull<T>(value: T | null | undefined): value is T {
  return value != null
}
