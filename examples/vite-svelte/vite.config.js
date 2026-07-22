import { svelte } from '@sveltejs/vite-plugin-svelte'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    svelte({
      inspector: {
        toggleKeyCombo: 'control-shift',
        showToggleButton: 'always',
        toggleButtonPos: 'bottom-right',
      },
    }),
  ],
})
