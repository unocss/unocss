import type { UnocssPluginContext } from '@unocss/core'
import { resolve } from 'pathe'
import { LAYER_MARK_ALL, VIRTUAL_ENTRY_ALIAS } from './constants'

export async function resolveId(ctx: UnocssPluginContext, id: string, importer?: string) {
  const { RESOLVED_ID_WITH_QUERY_RE, prefix } = await ctx.getVMPRegexes()

  if (id.match(RESOLVED_ID_WITH_QUERY_RE)) {
    return id
  }

  for (const alias of VIRTUAL_ENTRY_ALIAS) {
    const match = id.match(alias)
    if (match) {
      let virtual = match[1]
        ? `${prefix}_${match[1]}.css`
        : `${prefix}.css`
      virtual += match[2] || ''
      if (importer)
        virtual = resolve(importer, '..', virtual)
      else
        virtual = `/${virtual}`
      return virtual
    }
  }
}

export async function resolveLayer(ctx: UnocssPluginContext, id: string) {
  const { RESOLVED_ID_RE } = await ctx.getVMPRegexes()
  const match = id.match(RESOLVED_ID_RE)
  if (match) {
    return match[1] || LAYER_MARK_ALL
  }
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
