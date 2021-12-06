import { defineConfig } from 'vite'
import UnoCss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'
import presetIcons from '@unocss/preset-icons'
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
    UnoCss({
      mode: 'shadow-dom',
      include: [/\.ts$/],
      shortcuts: [
        { logo: 'i-logos-webcomponents w-6em h-6em transform transition-800 hover:rotate-180' },
      ],
      presets: [
        presetAttributify(),
        presetUno(),
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
      ],
      inspector: false,
    }),
    ViteInspector(),
  ],
})
