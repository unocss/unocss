import { defineNuxtModule } from '@nuxt/kit'
import Shiki from '@shikijs/markdown-it'
import LinkAttributes from 'markdown-it-link-attributes'
import Markdown from 'unplugin-vue-markdown/vite'

export default defineNuxtModule({
  async setup(_, nuxt) {
    nuxt.hook('vite:extendConfig', async (config) => {
      config.plugins!.push(
        Markdown({
          async markdownItSetup(md) {
            md.use(LinkAttributes, {
              matcher: (link: string) => /^https?:\/\//.test(link),
              attrs: {
                target: '_blank',
                rel: 'noopener',
              },
            })
            md.use(await Shiki({
              defaultColor: false,
              themes: {
                dark: 'vitesse-dark',
                light: 'vitesse-light',
              },
            }))
          },
        }),
      )
    })
  },
})
