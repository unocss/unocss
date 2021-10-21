import { defineConfig, presetAttributify, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  theme: {
    fontFamily: {
      sans: '\'Inter\', sans-serif',
      mono: '\'Fira Code\', monospace',
    },
  },
  presets: [
    presetAttributify({ strict: true }),
    presetIcons({
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
})
