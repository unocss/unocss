// eslint-disable-next-line no-restricted-imports
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export const defaultConfig = defineConfig({
  details: true,
  presets: [
    presetWind3(),
    presetAttributify(),
  ],
})

export default defineConfig({
  ...defaultConfig,
  presets: [
    ...defaultConfig.presets!,
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:100,200,400,700,800',
        mono: 'IBM Plex Mono',
      },
    }),
  ],
  shortcuts: [
    [/^badge-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5 rounded`],
    [/^badge-xs-(.*)$/, ([, c]) => `badge-${c} text-xs px2 py0.5`],
    [/^badge-sm-(.*)$/, ([, c]) => `badge-${c} text-sm px3 py0.6`],
    [/^badge-lg-(.*)$/, ([, c]) => `badge-${c} px3 py0.8`],
    [/^badge-square-(.*)$/, ([, c]) => `badge-${c} w-7 h-7 text-lg font-200 flex flex-none items-center justify-center`],
    {
      'border-main': 'border-gray:20',
      'bg-main': 'bg-white dark:bg-hex-121212',
      'btn': 'px-4 py-1 inline-block bg-cyan6 hover:bg-cyan7 text-white cursor-pointer disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
      'link': 'op50 hover:op100 hover:text-cyan6',
      'divider': 'border-b border-main',
    },
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
