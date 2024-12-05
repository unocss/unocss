import { definePreset } from '@unocss/core'
import { createWebFontPreset, normalizedFontMeta } from './preset'

export { createGoogleCompatibleProvider as createGoogleProvider } from './providers/google'
export { normalizedFontMeta }
export * from './types'

const userAgentWoff2 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const defaultFetch = async (url: string) => (await import('ofetch')).$fetch(url, { headers: { 'User-Agent': userAgentWoff2 }, retry: 3 })

/**
 * Preset for using web fonts by provide just the names.
 *
 * @see https://unocss.dev/presets/web-fonts
 */
export const presetWebFonts = definePreset(createWebFontPreset(defaultFetch))

export default presetWebFonts
