import type { ReplStore } from '@unocss/repl'
import { decompressFromEncodedURIComponent as decode, compressToEncodedURIComponent as encode } from 'lz-string'

const params = new URLSearchParams(
  window.location.hash.slice(1)
  || window.location.search
  || localStorage.getItem(STORAGE_KEY)
  || '',
)

export const selectedVersion = ref(params.get('version') || 'latest')

// Initial values from URL (used to initialize the store)
export const initialHTML = decode(params.get('html') || '') || defaultHTML
export const initialConfigRaw = decode(params.get('config') || '') || defaultConfigRaw
export const initialCSS = decode(params.get('css') || '') || defaultCSS
export const initialOptions = JSON.parse(decode(params.get('options') || '') || defaultOptions)

// Live refs (point to store refs after setup)
export const inputHTML = ref(initialHTML)
export const customConfigRaw = ref(initialConfigRaw)
export const customCSS = ref(initialCSS)
export const options = ref(initialOptions)

/**
 * Wire store refs to the playground's URL serialization.
 * Call this after the store is created.
 */
export function setupUrlSync(store: ReplStore) {
  // Point live refs at store refs
  inputHTML.value = store.inputHTML.value
  customConfigRaw.value = store.customConfigRaw.value
  customCSS.value = store.customCSS.value
  options.value = store.options.value

  // Replace with store refs (watch won't fire if values are same)
  // Use watchEffect to keep them in sync
  watch(() => store.inputHTML.value, (v) => { inputHTML.value = v })
  watch(() => store.customConfigRaw.value, (v) => { customConfigRaw.value = v })
  watch(() => store.customCSS.value, (v) => { customCSS.value = v })
  watch(() => store.options.value, (v) => { options.value = v }, { deep: true })

  // Serialize to URL on changes
  throttledWatch(
    [store.customConfigRaw, store.inputHTML, store.customCSS, store.options],
    () => updateUrl(store),
    { throttle: 1000, deep: true },
  )
}

export function updateUrl(store?: ReplStore) {
  const url = new URL('/play/', window.location.origin)
  if (selectedVersion.value !== 'latest')
    params.set('version', selectedVersion.value)
  else
    params.delete('version')
  params.set('html', encode(store?.inputHTML.value ?? inputHTML.value))
  params.set('config', encode(store?.customConfigRaw.value ?? customConfigRaw.value))
  params.set('css', encode(store?.customCSS.value ?? customCSS.value))
  params.set('options', encode(JSON.stringify(store?.options.value ?? options.value)))
  localStorage.setItem(STORAGE_KEY, url.search)
  window.history.replaceState('', '', `${url.pathname}#${params}`)
}
