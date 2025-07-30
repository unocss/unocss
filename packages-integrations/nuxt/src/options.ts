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
      wind3: import('@unocss/preset-wind3').then(m => m.default),
      wind4: import('@unocss/preset-wind4').then(m => m.default),
      attributify: import('@unocss/preset-attributify').then(m => m.default),
      icons: import('@unocss/preset-icons').then(m => m.default),
      webFonts: import('@unocss/preset-web-fonts').then(m => m.default),
      typography: import('@unocss/preset-typography').then(m => m.default),
      tagify: import('@unocss/preset-tagify').then(m => m.default),
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
