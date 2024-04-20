import type { Plugin } from 'vite'
import type { Preset, UnocssPluginContext } from '@unocss/core'

export function createWebFontPlugins(ctx: UnocssPluginContext): Plugin[] {
  return [
    {
      name: `unocss:web-fonts-local:dev`,
      enforce: 'pre',
      async configResolved(config) {
        const webFontPreset = await lookupPreset(ctx, '@unocss/preset-web-fonts')
        if (!webFontPreset || !webFontPreset.options?.downloadLocally)
          return

        if (webFontPreset.options.downloadLocally === true)
          webFontPreset.options.downloadLocally = {}

        if (typeof webFontPreset.options.downloadLocally.downloadDir === 'undefined')
          webFontPreset.options.downloadLocally.downloadDir = `${config.publicDir}/unocss-fonts`

        if (typeof webFontPreset.options.downloadLocally.downloadBasePath === 'undefined')
          webFontPreset.options.downloadLocally.downloadBasePath = config.base

        const [{ useLocalFont }, { getRemoteFontsCSS }] = await Promise.all([
          import('@unocss/preset-web-fonts/local-font'),
          import('@unocss/preset-web-fonts/remote-font'),
        ])
        const { $fetch } = await import('ofetch')
        const fontCSS = await getRemoteFontsCSS(webFontPreset.options.fontObject, { inlineImports: true, customFetch: $fetch })
        await useLocalFont(fontCSS, webFontPreset.options.downloadLocally)
      },
    },
  ]
}

async function lookupPreset<P extends Preset<any>>(ctx: UnocssPluginContext, presetName: P['name']) {
  await ctx.ready
  const preset: P | undefined = ctx.uno.config?.presets?.find(p => p.name === presetName) as any
  return preset
}
