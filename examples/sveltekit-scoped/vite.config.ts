import { sveltekit } from '@sveltejs/kit/vite'
import UnoCSS from '@unocss/svelte-scoped/vite'

import transformerDirectives from '@unocss/transformer-directives'
import { defineConfig } from 'vite'
import { getAllConfigFiles } from './getAllConfigFiles'

export default defineConfig({
  plugins: [
    UnoCSS({
      // all of these are optional
      injectReset: '@unocss/reset/tailwind.css',
      // to be able to use --at-apply in your .css files
      cssFileTransformers: [transformerDirectives()],
      // svelte-scoped will automatically run HMR when you adjust your uno.config.ts file, but if you have additional dependencies you want HMR for, you can specify them here
      configOrPath: {
        configDeps: getAllConfigFiles('./src/shortcuts'),
      },
    }),
    sveltekit(),
  ],
})
