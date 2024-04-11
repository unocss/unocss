import { definePreset } from '@unocss/core'
import { createWebFontPreset, normalizedFontMeta } from './preset'

export * from './types'
export { normalizedFontMeta }
export { createGoogleCompatibleProvider as createGoogleProvider } from './providers/google'

/**
 * Preset for using web fonts by provide just the names.
 *
 * @see https://unocss.dev/presets/web-fonts
 */
const presetWebFonts = definePreset(createWebFontPreset())

export default presetWebFonts
