import { decompressFromEncodedURIComponent as decode, compressToEncodedURIComponent as encode } from 'lz-string'

const params = new URLSearchParams(window.location.search || localStorage.getItem(STORAGE_KEY) || '')

interface Options {
  transform?: boolean
  responsive?: boolean
  width?: number
  height?: number
}

export const customConfigRaw = ref(decode(params.get('config') || '') || defaultConfigRaw)
export const inputHTML = ref(decode(params.get('html') || '') || defaultHTML)
export const options = ref<Options>(JSON.parse(decode(params.get('options') || '') || defaultOptions))
export const customCSS = ref(decode(params.get('css') || '') || defaultCSS)

throttledWatch(
  [customConfigRaw, inputHTML, customCSS, options],
  () => {
    const url = new URL('/play/', window.location.origin)
    url.searchParams.set('html', encode(inputHTML.value))
    url.searchParams.set('config', encode(customConfigRaw.value))
    url.searchParams.set('css', encode(customCSS.value))
    url.searchParams.set('options', encode(JSON.stringify(options.value)))
    localStorage.setItem(STORAGE_KEY, url.search)
    window.history.replaceState('', '', `${url.pathname}${url.search}`)
  },
  { throttle: 1000, deep: true },
)
