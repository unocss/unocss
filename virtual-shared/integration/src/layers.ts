import { resolve } from 'pathe'
import { LAYER_MARK_ALL, RESOLVED_ID_RE, RESOLVED_ID_WITH_QUERY_RE, VIRTUAL_ENTRY_ALIAS } from './constants'

export function resolveId(id: string, importer?: string) {
  if (id.match(RESOLVED_ID_WITH_QUERY_RE))
    return id

  for (const alias of VIRTUAL_ENTRY_ALIAS) {
    const match = id.match(alias)
    if (match) {
      let virtual = match[1]
        ? `__uno_${match[1]}.css`
        : '__uno.css'
      virtual += match[2] || ''
      if (importer)
        virtual = resolve(importer, '..', virtual)
      else
        virtual = `/${virtual}`
      return virtual
    }
  }
}

export function resolveLayer(id: string) {
  const match = id.match(RESOLVED_ID_RE)
  if (match)
    return match[1] || LAYER_MARK_ALL
}

/**
 * 1 - layer
 * 2 - escape-view
 *                                                                   111                             222
 */
// eslint-disable-next-line regexp/no-super-linear-backtracking
export const LAYER_PLACEHOLDER_RE = /#--unocss--\s*\{\s*layer\s*:\s*(.+?)\s*(?:;\s*escape-view\s*:\s*(.+?)\s*)?;?\s*\}/g
export function getLayerPlaceholder(layer: string) {
  // escape view is to determine how many backslashes will be prepended to special symbols in this scope.
  return `#--unocss--{layer:${layer};escape-view:\\"\\'\\\`\\\\}`
}

export function getCssEscaperForJsContent(view: string) {
  if (!view)
    return (css: string) => css

  const prefix: Record<string, string> = {}
  /**
   * 1 - backslashes before special char
   * 2 - special char
   */
  //                     111    2222222
  const escapeViewRe = /(\\*)\\(["'`\\])/g
  view.trim().replace(escapeViewRe, (_, bs, char) => {
    prefix[char] = bs.replace(/\\\\/g, '\\')
    return ''
  })
  return (css: string) => css.replace(/["'`\\]/g, (v) => {
    return (prefix[v] || '') + v
  })
}
export const HASH_PLACEHOLDER_RE = /#--unocss-hash--\s*\{\s*content\s*:\s*\\*"([^\\"]+)\\*";?\s*\}/g
export function getHashPlaceholder(hash: string) {
  return `#--unocss-hash--{content:"${hash}"}`
}
