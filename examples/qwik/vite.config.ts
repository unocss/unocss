import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import UnoCSS from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig(() => {
  return {
    plugins: [UnoCSS({

      preflights: [
        {
          getCSS: () => `:root {
            --qwik-dark-blue: #006ce9;
            --qwik-light-blue: #18b6f6;
            --qwik-light-purple: #ac7ff4;
            --qwik-dark-purple: #713fc2;
          }
          body {
            padding: 20px;
          }
          section {
            padding: 20px;
            border-bottom: 10px solid var(--qwik-dark-blue);
          }
          
          li::marker {
            color: var(--qwik-light-blue);
          }
          `,
        },

      ],
      shortcuts: {
        'command-first': 'p-1 whitespace-nowrap pr-5',
        'code': 'font-monospace text-xs',
      },
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          cdn: 'https://esm.sh/',
        }),
        presetWebFonts({
          provider: 'google',
          fonts: {
            sans: 'Poppins',
            monospace: 'Courier New',
          },
        }),
      ],
    }), qwikCity(), qwikVite(), tsconfigPaths()],
  }
})
