export const VIRTUAL_ENTRY_ALIAS = [
  /^(?:virtual:)?uno(?::(.+))?\.css(\?.*)?$/,
]
export const LAYER_MARK_ALL = '__ALL__'

export function resolveId(id: string) {
  for (const alias of VIRTUAL_ENTRY_ALIAS) {
    const match = id.match(alias)
    if (match) {
      return match[1]
        ? {
            id: `/__uno_${match[1]}.css`,
            layer: match[1],
          }
        : {
            id: '/__uno.css',
            layer: LAYER_MARK_ALL,
          }
    }
  }
}

export const RESOLVED_ID_RE = /\/__uno(_.*?)?\.css$/

export const LAYER_PLACEHOLDER_RE = /(\\?")?#--unocss--\s*{\s*layer\s*:\s*(.+?);?\s*}/g
export function getLayerPlaceholder(layer: string) {
  return `#--unocss--{layer:${layer}}`
}

export const HASH_PLACEHOLDER_RE = /#--unocss-hash--\s*{\s*content\s*:\s*\\*"(.+?)\\*";?\s*}/g
export function getHashPlaceholder(hash: string) {
  return `#--unocss-hash--{content:"${hash}"}`
}
