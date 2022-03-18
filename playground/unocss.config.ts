import { defineConfig, presetAttributify, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import transformerDirectives from '@unocss/transformer-directives'

export function createConfig({ strict = true, dev = true } = {}) {
  return defineConfig({
    envMode: dev ? 'dev' : 'build',
    theme: {
      fontFamily: {
        sans: '\'Inter\', sans-serif',
        mono: '\'Fira Code\', monospace',
      },
    },
    presets: [
      presetAttributify({ strict }),
      presetIcons({
        collections: {
          custom: {
            circle: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="50"></circle></svg>',
          },
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
}

export default createConfig()
