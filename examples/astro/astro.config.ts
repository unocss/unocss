import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  integrations: [
    {
      name: 'unocss',
      hooks: {
        'astro:config:setup': async ({ config, injectScript }) => {
          config.vite.plugins ||= []
          // @ts-expect-error cast
          config.vite.plugins.push(...UnoCSS())
          injectScript('page-ssr', `
import '@unocss/reset/tailwind.css';
import 'uno.css'
          `)
        },
      },
    },
  ],
})
