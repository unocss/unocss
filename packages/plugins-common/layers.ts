export const VIRTUAL_ENTRY_ALIAS = [
  /^(?:virtual:)?uno(?::(.+))?\.css(\?.*)?$/,
]
export const PLACEHOLDER_RE = /#--unocss--\s*{\s*layer\s*:\s*(.+?);?\s*}/g
export const ALL_LAYERS = '__ALL__'

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
          layer: ALL_LAYERS,
        }
    }
  }
}

export function getLayerPlaceholder(layer: string) {
  return `#--unocss--{layer:${layer}}`
}
