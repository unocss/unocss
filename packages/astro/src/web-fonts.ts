import type { Preset, UserConfigDefaults } from '@unocss/core'
import type { AstroConfig } from 'astro'

export function configureWebFontPreset(config: AstroConfig, options?: UserConfigDefaults) {
  const webFontPreset = options ? lookupPreset(options, '@unocss/preset-web-fonts') : undefined
  if (webFontPreset && !!webFontPreset.options?.downloadLocally) {
    const downloadDir = `${config.publicDir}/unocss-fonts`
    webFontPreset.options.downloadLocally = {
      downloadDir,
      downloadBasePath: config.base,
    }
  }
}

function lookupPreset<P extends Preset<any>>(options: UserConfigDefaults, presetName: P['name']) {
  const preset: P | undefined = (options.presets || []).flat().find(p => p.name === presetName) as any
  return preset
}
