import type { Plugin } from 'vite'
import { type PreflightContext, type Preset, type UnocssPluginContext, resolvePreset } from '@unocss/core'
import { useLocalFont } from '../../preset-web-fonts/src/local-font'
import { resolveDownloadDir } from '../../preset-web-fonts/src/util'
import { getRemoteFontsCSS } from '../../preset-web-fonts/src/remote-font'

// eslint-disable-next-line node/prefer-global/process
const isNode = typeof process !== 'undefined' && process.stdout && !process.versions.deno

export function createWebFontPlugins(ctx: UnocssPluginContext): Plugin[] {
  return [
    {
      name: `unocss:web-fonts-local:dev`,
      enforce: 'pre',
      apply: 'serve',
      async configureServer(_server) {
        if (!isNode)
          return

        const webFontPreset = lookupPreset(ctx, '@unocss/preset-web-fonts')

        if (!webFontPreset || !webFontPreset.options?.downloadLocally)
          return

        const { $fetch } = await import('ofetch')
        const fontCSS = await getRemoteFontsCSS(webFontPreset.options.fontObject, { inlineImports: true, customFetch: $fetch })
        const downloadDir = await resolveDownloadDir(webFontPreset.options.downloadDir)
        await useLocalFont(fontCSS, { downloadDir })
      },
    },
  ]
}

function lookupPreset<P extends Preset<any>>(ctx: UnocssPluginContext, presetName: P['name']) {
  const preset: P | undefined = ctx.uno.config?.presets?.find(p => p.name === presetName) as any
  return preset
}
