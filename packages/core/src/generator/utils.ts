import { CSSObject, CSSEntries } from '../types'
import { escapeSelector } from '../utils'

const reScopePlaceholder = / \$\$ /
export const hasScopePlaceholder = (css: string) => css.match(reScopePlaceholder)

export function applyScope(css: string, scope?: string) {
  if (hasScopePlaceholder(css))
    return css.replace(reScopePlaceholder, scope ? ` ${scope} ` : ' ')
  else
    return scope ? `${scope} ${css}` : css
}

export function toEscapedSelector(raw: string) {
  if (raw.startsWith('['))
    return raw.replace(/"(.*)"/, (_, i) => `"${escapeSelector(i)}"`)
  else
    return `.${escapeSelector(raw)}`
}

export function normalizeEntries(obj: CSSObject | CSSEntries) {
  return !Array.isArray(obj) ? Object.entries(obj) : obj
}
