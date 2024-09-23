import type { PluginOption } from 'vite'
import process from 'node:process'
import preact from '@preact/preset-vite'
import prefresh from '@prefresh/vite'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

const plugins: (PluginOption | PluginOption[])[] = [
  UnoCSS({
    shortcuts: [
      { logo: 'i-logos-react w-6em h-6em transform transition-800 hover:rotate-180' },
    ],
    presets: [
      presetUno(),
      presetAttributify(),
      presetIcons({
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
    ],
    inspector: true,
  }),
]

if (process.env.USE_REFRESH === 'true')
  plugins.unshift(prefresh())
else
  plugins.push(preact())

// https://vitejs.dev/config/
export default defineConfig({ plugins })
