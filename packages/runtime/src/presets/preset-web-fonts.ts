import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import { createPreset } from '../../../preset-web-fonts/src/preset'

const presetWebFonts = createPreset(url => fetch(url).then(data => data.json()))

window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
  presetWebFonts: (options: WebFontsOptions) => presetWebFonts(options),
})
