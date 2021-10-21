import { decompressFromEncodedURIComponent as decode, compressToEncodedURIComponent as encode } from 'lz-string'
import { defaultConfigRaw, defaultHTML, defaultOptions } from '../defaults'

const STORAGE_KEY = 'last-search'

const params = new URLSearchParams(window.location.search || localStorage.getItem(STORAGE_KEY) || '')

export const customConfigRaw = ref(decode(params.get('config') || '') || defaultConfigRaw)
export const inputHTML = ref(decode(params.get('html') || '') || defaultHTML)
export const options = ref<{ strict?: boolean }>(JSON.parse(decode(params.get('options') || '') || defaultOptions))

throttledWatch(
  [customConfigRaw, inputHTML, options],
  () => {
    const url = new URL('/', window.location.origin)
    url.searchParams.set('html', encode(inputHTML.value))
    url.searchParams.set('config', encode(customConfigRaw.value))
    url.searchParams.set('options', encode(JSON.stringify(options.value)))
    localStorage.setItem(STORAGE_KEY, url.search)
    window.history.replaceState('', '', `${url.pathname}${url.search}`)
  },
  { throttle: 1000, deep: true },
)
