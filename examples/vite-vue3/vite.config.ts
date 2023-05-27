import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetUno from '@unocss/preset-uno'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

const iconDirectory = resolve(__dirname, 'icons')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    UnoCSS({
      shortcuts: [
        { logo: 'i-logos-vue w-6em h-6em transform transition-800' },
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          warn: true,
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
          collections: {
            custom: FileSystemIconLoader(iconDirectory),
          },
          sprites: {
            collections: ['custom'],
            loader: (name) => {
              if (name === 'custom') {
                return {
                  'close': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/></svg>',
                  'chevron-down': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6l1.41-1.42Z"/></svg>',
                  'chevron-up': '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6l1.41 1.41Z"/></svg>',
                }
              }
            },
          },
        }),
      ],
    }),
  ],
})
