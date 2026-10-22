const VITE_VIRTUAL_ID_PREFIX = '\0'
const VITE_CLIENT_ID_PREFIX = '/@id/'
const VITE_NULL_BYTE_PLACEHOLDER = '__x00__'

export function toViteVirtualId(id: string) {
  return id.startsWith(VITE_VIRTUAL_ID_PREFIX)
    ? id
    : `${VITE_VIRTUAL_ID_PREFIX}${id}`
}

export function toViteClientPath(id: string) {
  return id.startsWith(VITE_VIRTUAL_ID_PREFIX)
    ? `${VITE_CLIENT_ID_PREFIX}${id.replace(VITE_VIRTUAL_ID_PREFIX, VITE_NULL_BYTE_PLACEHOLDER)}`
    : id
}
