import type { UnocssNuxtOptions } from './types'
import { defaultPipelineExclude } from '#integration/defaults'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetTagify from '@unocss/preset-tagify'
import presetTypography from '@unocss/preset-typography'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'

export function resolveOptions(options: UnocssNuxtOptions) {
  if (options.wind3 && options.wind4) {
    console.warn('[unocss/nuxt]: wind3 and wind4 presets are mutually exclusive. wind3 will be disabled in favor of wind4.')
    options.wind3 = false
  }

  if (options.presets == null) {
    options.presets = []
    const presetMap = {
      wind3: presetWind3,
      wind4: presetWind4,
      attributify: presetAttributify,
      icons: presetIcons,
      webFonts: presetWebFonts,
      typography: presetTypography,
      tagify: presetTagify,
    }
    for (const [key, preset] of Object.entries(presetMap)) {
      const option = options[key as keyof UnocssNuxtOptions]
      if (option) {
        options.presets.push(preset(typeof option === 'boolean' ? {} as any : option))
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
