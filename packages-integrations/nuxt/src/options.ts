import type { UnocssNuxtOptions } from './types'
import { defaultPipelineExclude } from '#integration/defaults'

export async function resolveOptions(options: UnocssNuxtOptions) {
  if (options.wind3 && options.wind4) {
    console.warn('[unocss/nuxt]: wind3 and wind4 presets are mutually exclusive. wind3 will be disabled in favor of wind4.')
    options.wind3 = false
  }

  if (options.presets == null) {
    options.presets = []
    const presetMap = {
      wind3: import('unocss').then(m => m.presetWind3),
      wind4: import('unocss').then(m => m.presetWind4),
      attributify: import('unocss').then(m => m.presetAttributify),
      icons: import('unocss').then(m => m.presetIcons),
      webFonts: import('unocss').then(m => m.presetWebFonts),
      typography: import('unocss').then(m => m.presetTypography),
      tagify: import('unocss').then(m => m.presetTagify),
    }
    for (const [key, preset] of Object.entries(presetMap)) {
      const option = options[key as keyof UnocssNuxtOptions]
      if (option) {
        options.presets.push((await preset)(typeof option === 'boolean' ? {} as any : option))
      }
    }
  }

  options.content ??= {}
  options.content.pipeline ??= {}
  if (options.content.pipeline !== false) {
    options.content.pipeline.exclude ??= defaultPipelineExclude
    if (Array.isArray(options.content.pipeline.exclude))
    // ignore macro files created by Nuxt
      options.content.pipeline.exclude.push(/\?macro=true/)
  }
}
