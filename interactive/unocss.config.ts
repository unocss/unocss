// eslint-disable-next-line no-restricted-imports
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export const defaultConfig = defineConfig<{}>({
  details: true,
  presets: [
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default as any),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default as any),
        logos: () => import('@iconify-json/logos/icons.json').then(i => i.default as any),
        twemoji: () => import('@iconify-json/twemoji/icons.json').then(i => i.default as any),
        ri: () => import('@iconify-json/ri/icons.json').then(i => i.default as any),
        tabler: () => import('@iconify-json/tabler/icons.json').then(i => i.default as any),
        uim: () => import('@iconify-json/uim/icons.json').then(i => i.default as any),
      },
    }),
    presetUno(),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})

export default defineConfig<{}>({
  ...defaultConfig,
  presets: [
    ...defaultConfig.presets as any,
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'IBM Plex Mono',
      },
    }),
  ],
  shortcuts: [
    {
      'border-base': 'border-gray-500:10',
      'bg-base': 'bg-white dark:bg-hex-121212',
      'btn': 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
      'link': 'op50 hover:op100 hover:text-teal6',
      'divider': 'border-b border-base',
    },
    [/^badge-xs-(.*)$/, ([, c]) => `badge-${c} text-xs px2 py0.5`],
    [/^badge-sm-(.*)$/, ([, c]) => `badge-${c} text-sm px3 py0.6`],
    [/^badge-lg-(.*)$/, ([, c]) => `badge-${c} px3 py0.8`],
    [/^badge-square-(.*)$/, ([, c]) => `badge-${c} w-7 h-7 text-lg font-200 flex flex-none items-center justify-center`],
    [/^badge-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5 rounded`],
  ],
})
