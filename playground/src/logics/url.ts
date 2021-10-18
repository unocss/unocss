import { decompressFromEncodedURIComponent as decode, compressToEncodedURIComponent as encode } from 'lz-string'
import { defaultConfigRaw, defaultHTML } from '../defaults'

const STORAGE_KEY = 'last-search'

const params = new URLSearchParams(window.location.search || localStorage.getItem(STORAGE_KEY) || '')

export const customConfigRaw = ref(decode(params.get('config') || '') || defaultConfigRaw)
export const inputHTML = ref(decode(params.get('html') || '') || defaultHTML)

throttledWatch(
  [customConfigRaw, inputHTML],
  () => {
    const url = new URL('/', window.location.origin)
    url.searchParams.set('html', encode(inputHTML.value))
    url.searchParams.set('config', encode(customConfigRaw.value))
    localStorage.setItem(STORAGE_KEY, url.search)
    window.history.replaceState('', '', `${url.pathname}${url.search}`)
  },
  { throttle: 1000 },
)
