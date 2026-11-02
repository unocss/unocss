const VITE_VIRTUAL_ID_PREFIX = '\0'
const VITE_CLIENT_ID_PREFIX = '/@id/'
const VITE_NULL_BYTE_PLACEHOLDER = '__x00__'

function isViteVirtualId(id: string) {
  return id.startsWith(VITE_VIRTUAL_ID_PREFIX)
}

export function toViteVirtualId(id: string) {
  return isViteVirtualId(id)
    ? id
    : `${VITE_VIRTUAL_ID_PREFIX}${id}`
}

export function fromViteVirtualId(id: string) {
  return isViteVirtualId(id)
    ? id.slice(VITE_VIRTUAL_ID_PREFIX.length)
    : id
}

export function toViteClientPath(id: string) {
  return isViteVirtualId(id)
    ? `${VITE_CLIENT_ID_PREFIX}${id.replace(VITE_VIRTUAL_ID_PREFIX, VITE_NULL_BYTE_PLACEHOLDER)}`
    : id
}
