import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
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
 * Resolve one `@unocss <params>` directive to CSS, for the integrations that splice
 * layers into a stylesheet rather than serving them as a virtual module.
 *
 * `emitted` accumulates the layer names earlier directives in the same file consumed,
 * so that a later bare directive picks up whatever is left. Pass `directive` when the
 * name is configurable, as it is in `@unocss/postcss`.
 */
export function selectLayers(
  result: GenerateResult,
  params: string | undefined,
  emitted: string[],
  directive = 'unocss',
): string {
  if (!params)
    return result.getLayers(undefined, emitted) || ''

  const include: string[] = []
  const exclude: string[] = []

  for (const raw of params.split(',')) {
    const name = raw.trim()
    if (!name)
      continue

    if (name.startsWith('!')) {
      if (name.length > 1)
        exclude.push(name.slice(1))
    }
    else {
      include.push(name)
    }
  }

  if (include.length && exclude.length)
    console.warn(`Warning: Mixing normal and negated layer names in "@${directive} ${params}" is not recommended.`)

  if (include.length) {
    emitted.push(...include)
    return include
      .map(name => (name === 'all' ? result.getLayers() : result.getLayer(name)) || '')
      .filter(Boolean)
      .join('\n')
  }

  if (exclude.length) {
    emitted.push(...exclude)
    return result.getLayers(undefined, exclude) || ''
  }

  // invalid syntax emits nothing
  return ''
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
