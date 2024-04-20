import type { Preset } from '@unocss/core'
import type { Nuxt } from '@nuxt/schema'
import { dirname, relative } from 'pathe'
import { defaultFontCssFilename } from '@unocss/preset-web-fonts/local-font'
import type { UnocssNuxtOptions } from './types'

export function configureWebFontPreset(nuxt: Nuxt, options: UnocssNuxtOptions) {
  const webFontPreset = lookupPreset(options, '@unocss/preset-web-fonts')
  if (webFontPreset && !!webFontPreset.options?.downloadLocally) {
    const downloadDir = `${nuxt.options.dir.public}/unocss-fonts`
    webFontPreset.options.downloadLocally = {
      downloadDir,
      downloadBasePath: nuxt.options.app.baseURL,
    }
    nuxt.options.css ??= []
    nuxt.options.css.push(`~/${relative(dirname(nuxt.options.dir.public), downloadDir)}/${defaultFontCssFilename}`.replaceAll('\\', '/'))
  }
}

function lookupPreset<P extends Preset<any>>(options: UnocssNuxtOptions, presetName: P['name']) {
  const preset: P | undefined = (options.presets || []).flat().find(p => p.name === presetName) as any
  return preset
}
