import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetTypography from '@unocss/preset-typography'
import presetTagify from '@unocss/preset-tagify'
import presetWind from '@unocss/preset-wind'
import type { Preset } from '@unocss/core'
import type { Nuxt } from '@nuxt/schema'
import { defaultPipelineExclude } from '../../shared-integration/src/defaults'
import type { UnocssNuxtOptions } from './types'

export function resolveOptions(nuxt: Nuxt, options: UnocssNuxtOptions) {
  if (options.presets == null) {
    options.presets = []
    const presetMap = {
      uno: presetUno,
      attributify: presetAttributify,
      tagify: presetTagify,
      icons: presetIcons,
      webFonts: presetWebFonts,
      typography: presetTypography,
      wind: presetWind,
    }
    for (const [key, preset] of Object.entries(presetMap)) {
      const option = options[key as keyof UnocssNuxtOptions]
      if (option)
        options.presets.push(preset(typeof option === 'boolean' ? {} as any : option))
    }
  }

  const webFontPreset = lookupPreset(options, '@unocss/preset-web-fonts')
  if (webFontPreset && !!webFontPreset.options?.downloadLocally) {
    webFontPreset.options.downloadLocally = {}
    webFontPreset.options.downloadLocally.downloadDir = `${nuxt.options.dir.public}/unocss-fonts`
    webFontPreset.options.downloadLocally.downloadBasePath = nuxt.options.app.baseURL
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

function lookupPreset<P extends Preset<any>>(options: UnocssNuxtOptions, presetName: P['name']) {
  const preset: P | undefined = (options.presets || []).flat().find(p => p.name === presetName) as any
  return preset
}
