import { CSSObject, CSSEntries } from '../types'
import { escapeSelector as e } from '../utils'

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
    return raw.replace(/^\[(.+?)(~?=)"(.*)"\]$/, (_, n, s, i) => `[${e(n)}${s}"${e(i)}"]`)
  else
    return `.${e(raw)}`
}

export function normalizeEntries(obj: CSSObject | CSSEntries) {
  return !Array.isArray(obj) ? Object.entries(obj) : obj
}
