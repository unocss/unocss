import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  optimizeDeps: {
    exclude: [
      'vitepress',
    ],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  /* resolve: {
    alias: [
      {
        find: /^.*\/VPSwitcher\.vue$/,
        replacement: fileURLToPath(
          new URL('./.vitepress/theme/components/UnoCSSSwitcher.vue', import.meta.url),
        ),
      },
      {
        find: /^.*\/VPNavScreen\.vue$/,
        replacement: fileURLToPath(
          new URL('./.vitepress/theme/components/UnoCSSNavScreen.vue', import.meta.url),
        ),
      },
      {
        find: /^.*\/VPNavBarExtra\.vue$/,
        replacement: fileURLToPath(
          new URL('./.vitepress/theme/components/UnoCSSNavBarExtra.vue', import.meta.url),
        ),
      },
      {
        find: /^.*\/VPNavBar\.vue$/,
        replacement: fileURLToPath(
          new URL('./.vitepress/theme/components/UnoCSSNavBar.vue', import.meta.url),
        ),
      },
    ],
  }, */
  plugins: [
    UnoCSS(),
    Components({
      dirs: [
        '.vitepress/theme/components',
      ],
      include: [
        /\.vue$/,
        /\.vue\?vue/,
        /\.md$/,
      ],
    }),
  ],
})
