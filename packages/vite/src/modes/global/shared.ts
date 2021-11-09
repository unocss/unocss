
export const READY_CALLBACK_DEFAULT = '/__unocss_ready'
export const VIRTUAL_ENTRY_DEFAULT = '/__unocss_entry.css'
export const ALL_LAYERS = '__ALL__'
export const VIRTUAL_ENTRY_ALIAS = [
  /^(?:virtual:)?uno(?::(.+))?\.css(\?.*)?$/,
]

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
