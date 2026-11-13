import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import type { RuntimeContext } from '..'
import { createWebFontPreset } from '@unocss/preset-web-fonts'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, (() => {
  const presetWebFonts = createWebFontPreset(url => fetch(url).then(data => data.json()))

  return {
    presetWebFonts: (options: WebFontsOptions) => presetWebFonts(options),
  }
})())
