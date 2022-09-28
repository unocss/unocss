import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'

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
          .host {
            --rotation: 135deg;
            --rotation: 225deg;
            --size-step: 10px;
            --odd-color-step: 5;
            --even-color-step: 5;
            --center: 12;  
          }
          .square {
            --size: calc(40px + var(--index) * var(--size-step));
            width: var(--size);
            height: var(--size);
            transform: rotateZ(calc(var(--rotation) * var(--state) * (var(--center) - var(--index))));
            transition-property: transform, border-color;
            transition-duration: 5s;
            transition-timing-function: ease-in-out;
            grid-area: 1 / 1;
          }
          
          .square.odd {
            --luminance: calc(1 - calc(calc(var(--index) * var(--odd-color-step)) / 256));
            background: rgb(
              calc(172 * var(--luminance)),
              calc(127 * var(--luminance)),
              calc(244 * var(--luminance))
            );
          }
          
          .pride .square:nth-child(12n + 1) {
            background: #e70000;
          }
          .pride .square:nth-child(12n + 3) {
            background: #ff8c00;
          }
          .pride .square:nth-child(12n + 5) {
            background: #ffef00;
          }
          .pride .square:nth-child(12n + 7) {
            background: #00811f;
          }
          .pride .square:nth-child(12n + 9) {
            background: #0044ff;
          }
          .pride .square:nth-child(12n + 11) {
            background: #760089;
          }
          `,
        },
      ],
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
    }), qwikCity(), qwikVite()],
  }
})
