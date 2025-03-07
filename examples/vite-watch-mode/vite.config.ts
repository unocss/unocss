import type { PluginOption } from 'vite'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWind3 from '@unocss/preset-wind3'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

const plugins: (PluginOption | PluginOption[])[] = [
  UnoCSS({
    shortcuts: [
      { logo: 'i-logos-react w-6em h-6em transform transition-800 hover:rotate-180' },
    ],
    inspector: false,
    presets: [
      presetWind3(
      ),
      presetAttributify(),
      presetIcons({
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
    ],
  }),
]

plugins.push(react())

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  build: {
    lib: {
      formats: ['es', 'cjs'],
      name: 'main',
      entry: 'src/main.tsx',
    },
  },
})
