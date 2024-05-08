import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Preset, UserConfigDefaults } from '@unocss/core'
import type { AstroConfig } from 'astro'

export async function configureWebFontPreset(config: AstroConfig, options?: UserConfigDefaults) {
  const webFontPreset = options ? lookupPreset(options, '@unocss/preset-web-fonts') : undefined
  if (webFontPreset && !!webFontPreset.options?.downloadLocally) {
    const { defaultFontFolder } = await import('@unocss/preset-web-fonts/local-font')
    const downloadDir = resolve(fileURLToPath(config.publicDir), defaultFontFolder)
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
