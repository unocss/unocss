import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Miniwind from '../packages/vite/src'
import { mergeDeep, defaultTheme, presetDefault, presetAttributify } from '../packages/miniwind/src'

export default defineConfig({
  plugins: [
    Vue(),
    Miniwind({
      theme: mergeDeep(
        defaultTheme,
        {
          fontFamily: {
            sans: '\'Inter\', sans-serif',
            mono: '\'Fira Code\', monospace',
          },
        },
      ),
      presets: [
        presetAttributify(),
        presetDefault(),
      ],
    }),
    Icons({ autoInstall: true }),
    Inspect(),
    Components({
      dts: 'src/components.d.ts',
      resolvers: [
        IconsResolver({ prefix: '' }),
      ],
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  build: {
    minify: false,
  },
})
