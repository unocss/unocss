// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';
import presetWind4 from '@unocss/preset-wind4'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'

export default defineConfig((/* ctx */) => {
  return {
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20'
      },

      vitePlugins: [
        ["unocss/vite", {
          presets: [
            presetWind4(),
            presetAttributify(),
            presetIcons(),
          ],
        }]
      ],

      typescript: {
        strict: true,
        vueShim: true
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      devServer: {
        open: true // opens browser window automatically
      },

    }

  }
});
