// UnoCSS config options can also be placed in vite.config.ts, but make sure to at least have a blank unocss.config.ts if you are having trouble getting the UnoCSS VSCode extension to work

import { defineConfig, presetIcons, presetTypography, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  shortcuts: [
    { logo: 'i-logos:svelte-icon w-7em h-7em transform transition-300' },
  ],
  transformers: [
    transformerDirectives(),
  ],
  presets: [
    presetUno(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetTypography(),
  ],
  safelist: ['bg-orange-300', 'prose'],
})
