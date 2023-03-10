import { createPreset, normalizedFontMeta } from './preset'

export * from './types'
export { normalizedFontMeta }

const userAgentWoff2 = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
const defaultFetch = async (url: string) => (await import('ofetch')).$fetch(url, { headers: { 'User-Agent': userAgentWoff2 }, retry: 3 })
const preset = createPreset(defaultFetch)

export default preset
