import { defineConfig } from "vitepress"
import { version } from '../../package.json'



export default defineConfig({
    title: "unocss",
    description: "The instant on-demand atomic CSS engine.",
    head: [
        ['meta', { property: 'og:title', content: 'unocss' }],
        ['meta', { property: 'og:description', content: 'The instant on-demand atomic CSS engine' }],
        ['meta', { property: 'og:url', content: 'https://github.com/unocss/unocss' }],
        ['meta', { property: 'og:image', content: 'https://github.com/unocss/unocss/docs/public/logo.png' }],
        ['meta', { name: 'twitter:title', content: 'unocss' }],
        ['meta', { name: 'twitter:description', content: 'The instant on-demand atomic CSS engine' }],
        ['meta', { name: 'twitter:image', content: 'https://github.com/unocss/unocss/docs/public/logo.png' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
        ['link', { href: 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;400;600&display=swap', rel: 'stylesheet' }],
    ],
    themeConfig: {
        logo: '/logo.png',
        repo: "unocss/unocss",
        docsBranch: "main",
        editLinks: true,
        editLinkText: 'Suggest changes to this page',
        nav: [
            { text: 'Guide', link: '/guide/' },
            {
                text: 'Plugins',
                items: [
                    { text: 'vite', link: '/plugins/vite' },
                    { text: 'webpack', link: '/plugins/webpack' },
                ]
            },
            { text: 'Config', link: '/config/' },
            { text: 'Examples', link: 'https://github.com/unocss/unocss/tree/main/test/fixtures' },
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
                ]
            }
        ],
        sidebar: {
            '/config': 'auto',
            '/api': 'auto'
        }

    },
})
