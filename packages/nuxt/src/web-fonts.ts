import type { Preset } from '@unocss/core'
import type { Nuxt } from '@nuxt/schema'
import { dirname, relative, resolve } from 'pathe'
import type { UnocssNuxtOptions } from './types'

export async function configureWebFontPreset(nuxt: Nuxt, options: UnocssNuxtOptions) {
  const webFontPreset = lookupPreset(options, '@unocss/preset-web-fonts')
  if (webFontPreset && !!webFontPreset.options?.downloadLocally) {
    const { defaultFontFolder, defaultFontCssFilename } = await import('@unocss/preset-web-fonts/local-font')
    const downloadDir = resolve(nuxt.options.dir.public, defaultFontFolder)
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
