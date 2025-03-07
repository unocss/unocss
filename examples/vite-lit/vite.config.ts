import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetTypography from '@unocss/preset-typography'
import presetWind3 from '@unocss/preset-wind3'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import ViteInspector from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/my-element.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
  plugins: [
    UnoCSS({
      mode: 'shadow-dom',
      shortcuts: [
        { logo: 'i-logos-webcomponents w-6em h-6em transform transition-800 hover:rotate-180' },
        { 'cool-blue': 'bg-blue-500 text-white' },
        { 'cool-green': 'bg-green-500 text-black' },
      ],
      presets: [
        presetWind3(),
        presetAttributify(),
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
        presetTypography(),
      ],
      inspector: false,
    }),
    ViteInspector(),
  ],
})
