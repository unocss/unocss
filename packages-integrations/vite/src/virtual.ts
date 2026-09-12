const VITE_VIRTUAL_ID_PREFIX = '\0'

export function toViteVirtualId(id: string) {
  return id.startsWith(VITE_VIRTUAL_ID_PREFIX)
    ? id
    : `${VITE_VIRTUAL_ID_PREFIX}${id}`
}
