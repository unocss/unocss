import { version as viteVersion } from 'vite'

const VITE_VIRTUAL_ID_PREFIX = '\0'
const VITE_CLIENT_ID_PREFIX = '/@id/'
const VITE_NULL_BYTE_PLACEHOLDER = '__x00__'

const VITE_RAW_HMR_URL_SINCE_MAJOR = 8
const VITE_RAW_HMR_URL_SINCE_MINOR = 3

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

/**
 * Vite registers a module's hot context under this path, and looks it up again
 * when it applies an HMR update. Until Vite 8.3 the path was the client-facing
 * virtual path, e.g. `/@id/__x00__/__uno.css`. Since Vite 8.3 it is the raw
 * module URL, e.g. `\0/__uno.css` (vitejs/vite#23172).
 */
export function toViteHmrPath(id: string, version: string = viteVersion) {
  return registersRawHmrUrl(version) ? id : toViteClientPath(id)
}

function registersRawHmrUrl(version: string) {
  const [major, minor] = version.split('.').map(Number)
  return major > VITE_RAW_HMR_URL_SINCE_MAJOR
    || (major === VITE_RAW_HMR_URL_SINCE_MAJOR && minor >= VITE_RAW_HMR_URL_SINCE_MINOR)
}
