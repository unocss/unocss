import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    plugins: [UnoCSS({
      shortcuts: [
        { logo: 'i-logos-qwik w-6em h-6em transform transition-800 hover:rotate-180' },
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          cdn: 'https://esm.sh/',
        }),
      ],
    }), qwikCity(), qwikVite()],
  }
})
