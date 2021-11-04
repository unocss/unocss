
export const READY_CALLBACK_DEFAULT = '/__unocss_ready'
export const VIRTUAL_ENTRY_DEFAULT = '/__unocss/entry.css'
export const ALL_LAYERS = '__ALL__'
export const VIRTUAL_ENTRY_ALIAS = [
  /^(?:virtual:)?uno(?:-(.+))?\.css$/,
]

export function resolveId(id: string, base = '/') {
  for (const alias of VIRTUAL_ENTRY_ALIAS) {
    const match = id.match(alias)
    if (match) {
      return match[1]
        ? {
          id: `${base}__uno_${match[1]}.css`,
          layer: match[1],
        }
        : {
          id: `${base}__uno.css`,
          layer: ALL_LAYERS,
        }
    }
  }
}
