import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

export default defineConfig({
  title: 'UnoCSS',
  description: 'The instant on-demand atomic CSS engine.',
  head: [
    ['meta', { property: 'og:title', content: 'UnoCSS' }],
    ['meta', { property: 'og:description', content: 'The instant on-demand atomic CSS engine' }],
    ['meta', { property: 'og:url', content: 'https://github.com/unocss/unocss' }],
    ['meta', { property: 'og:image', content: 'https://repository-images.githubusercontent.com/412152628/30d80147-4535-4ff1-9837-b9015eecbb07' }],
    ['meta', { name: 'twitter:title', content: 'UnoCSS' }],
    ['meta', { name: 'twitter:description', content: 'The instant on-demand atomic CSS engine' }],
    ['meta', { name: 'twitter:image', content: 'https://repository-images.githubusercontent.com/412152628/30d80147-4535-4ff1-9837-b9015eecbb07' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;400;600&display=swap', rel: 'stylesheet' }],
  ],
  themeConfig: {
    logo: '/logo.png',
    repo: 'unocss/unocss',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Suggest changes to this page',
    nav: [
      { text: 'Guide', link: '/guide/' },
      {
        text: 'Integrations',
        items: [
          { text: 'Vite', link: '/integrations/vite' },
          { text: 'Nuxt', link: '/integrations/nuxt' },
          { text: 'Webpack', link: '/integrations/webpack' },
          { text: 'Runtime', link: '/integrations/runtime' },
        ],
      },
      {
        text: 'Presets',
        items: [
          { text: 'Uno', link: '/presets/uno' },
          { text: 'Mini', link: '/presets/mini' },
          { text: 'Wind', link: '/presets/wind' },
          { text: 'Icons', link: '/presets/icons' },
          { text: 'Attributify', link: '/presets/attributify' },
          { text: 'Web Fonts', link: '/presets/web-fonts' },
        ],
      },
      { text: 'Config', link: '/config/' },
      { text: 'Play', link: 'https://unocss.antfu.me/' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Release Notes ',
            link: 'https://github.com/unocss/unocss/releases',
          },
          {
            text: 'Contributing ',
            link: 'https://github.com/unocss/unocss/blob/main/CONTRIBUTING.md',
          },
        ],
      },
    ],
    sidebar: {
      '/config': 'auto',
      '/api': 'auto',
    },
  },
})
