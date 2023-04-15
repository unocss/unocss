import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress/types'
import { version } from '../../package.json'

const ogUrl = 'https://unocss.dev/'
const ogImage = `${ogUrl}og.png#1`
const title = 'UnoCSS'
const description = 'The instant on-demand Atomic CSS engine'

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: 'Getting Started', link: '/guide/' },
  { text: 'Why UnoCSS?', link: '/guide/why' },
  { text: 'Presets', link: '/guide/presets' },
  { text: 'Style reset', link: '/guide/style-reset' },
  { text: 'Config file', link: '/guide/config-file' },
  { text: 'Extracting & Safelist', link: '/guide/extracting' },
]

const Configs: DefaultTheme.NavItemWithLink[] = [
  { text: 'Overview', link: '/config/' },
  { text: 'Rules', link: '/config/rules' },
  { text: 'Shortcuts', link: '/config/shortcuts' },
  { text: 'Theme', link: '/config/theme' },
  { text: 'Variants', link: '/config/variants' },
  { text: 'Extractors', link: '/config/extractors' },
  { text: 'Transformers', link: '/config/transformers' },
  { text: 'Preflights', link: '/config/preflights' },
  { text: 'Layers', link: '/config/layers' },
  { text: 'Presets', link: '/config/presets' },
]

const Integrations: DefaultTheme.NavItemWithLink[] = [
  { text: 'Vite', link: '/integrations/vite' },
  { text: 'Nuxt', link: '/integrations/nuxt' },
  { text: 'Astro', link: '/integrations/astro' },
  { text: 'Webpack', link: '/integrations/webpack' },
  { text: 'Runtime', link: '/integrations/runtime' },
  { text: 'CLI', link: '/integrations/cli' },
  { text: 'PostCSS', link: '/integrations/postcss' },
  { text: 'ESLint', link: '/integrations/eslint' },
  { text: 'VSCode extension', link: '/integrations/vscode' },
]

const Presets: DefaultTheme.NavItemWithLink[] = [
  { text: 'Uno (default)', link: '/presets/uno' },
  { text: 'Icons', link: '/presets/icons' },
  { text: 'Attributify', link: '/presets/attributify' },
  { text: 'Typography', link: '/presets/typography' },
  { text: 'Web fonts', link: '/presets/web-fonts' },
  { text: 'Wind', link: '/presets/wind' },
  { text: 'Mini', link: '/presets/mini' },
  { text: 'Tagify', link: '/presets/tagify' },
  { text: 'Rem to px', link: '/presets/rem-to-px' },
]

const Transformers: DefaultTheme.NavItemWithLink[] = [
  { text: 'Variant Group', link: '/transformers/variant-group' },
  { text: 'Directives', link: '/transformers/directives' },
  { text: 'Compile Class', link: '/transformers/compile-class' },
  { text: 'Attributify JSX', link: '/transformers/attributify-jsx' },
]

const Extractors: DefaultTheme.NavItemWithLink[] = [
  { text: 'Pug Extractor', link: '/extractors/pug' },
  { text: 'Svelte Extractor', link: '/extractors/svelte' },
  { text: 'Arbitrary Variants Extractor', link: '/extractors/arbitrary-variants' },
]

const Tools: DefaultTheme.NavItemWithLink[] = [
  { text: 'Inspector', link: '/tools/inspector' },
  { text: 'Core', link: '/tools/core' },
  { text: 'Autocomplete', link: '/tools/autocomplete' },
]

const Nav: DefaultTheme.NavItem[] = [
  {
    text: 'Guide',
    items: [
      {
        text: 'Guide',
        items: Guides,
      },
    ],
  },
  {
    text: 'Integrations',
    items: [
      {
        text: 'Integrations',
        items: Integrations,
      },
      {
        text: 'Examples',
        link: 'https://github.com/unocss/unocss/tree/main/examples',
      },
    ],
  },
  {
    text: 'Config',
    items: [
      {
        text: 'Config File',
        link: '/guide/config-file',
      },
      {
        text: 'Concepts',
        items: Configs,
      },
    ],
  },
  {
    text: 'Presets',
    items: [
      {
        text: 'Overview',
        link: '/presets/',
      },
      {
        text: 'Community Presets',
        link: '/presets/community',
      },
      {
        text: 'Presets',
        items: Presets,
      },
      {
        text: 'Transformers',
        items: Transformers,
      },
      {
        text: 'Extractors',
        items: Extractors,
      },
    ],
  },
  { text: 'Interactive Docs', link: `${ogUrl}interactive/`, target: '_blank' },
  { text: 'Playground', link: `${ogUrl}play/`, target: '_blank' },
  {
    text: `v${version}`,
    items: [
      {
        text: 'Release Notes',
        link: 'https://github.com/unocss/unocss/releases',
      },
      {
        text: 'Contributing',
        link: 'https://github.com/unocss/unocss/blob/main/CONTRIBUTING.md',
      },
    ],
  },
]

const SidebarGuide: DefaultTheme.SidebarItem[] = [
  {
    text: 'Guides',
    items: Guides,
  },
  {
    text: 'Integrations',
    items: Integrations,
  },
  {
    text: 'Presets',
    link: '/presets/',
  },
  {
    text: 'Config',
    link: '/config/',
  },
  {
    text: 'Examples',
    link: 'https://github.com/unocss/unocss/tree/main/examples',
  },
]

const SidebarPresets: DefaultTheme.SidebarItem[] = [
  {
    text: 'Overview',
    link: '/presets/',
  },
  {
    text: 'Presets',
    collapsed: false,
    items: Presets,
  },
  {
    text: 'Community Presets',
    link: '/presets/community',
  },
  {
    text: 'Transformers',
    collapsed: false,
    items: Transformers,
  },
  {
    text: 'Extractors',
    collapsed: false,
    items: Extractors,
  },
  {
    text: 'Other packages',
    collapsed: false,
    items: Tools,
  },
]

const SidebarConfig: DefaultTheme.SidebarItem[] = [
  {
    text: 'Config',
    collapsed: false,
    items: Configs,
  },
  {
    text: 'Config File',
    link: '/guide/config-file',
  },
]

export default defineConfig({
  lang: 'en-US',
  title,
  titleTemplate: title,
  description,
  outDir: './dist',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    ['meta', { name: 'author', content: 'Anthony Fu' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: title }],
    ['meta', { name: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:site', content: '@antfu7' }],
    ['meta', { name: 'twitter:url', content: ogUrl }],
    ['link', { rel: 'search', type: 'application/opensearchdescription+xml', href: '/search.xml', title: 'UnoCSS' }],
  ],
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: [
    /^\/play/,
    /^\/interactive/,
    /:\/\/localhost/,
  ],

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    nav: Nav,
    search: {
      provider: 'local',
    },
    sidebar: {
      '/guide/': SidebarGuide,
      '/integrations/': SidebarGuide,

      '/tools/': SidebarPresets,
      '/presets/': SidebarPresets,
      '/transformers/': SidebarPresets,
      '/extractors/': SidebarPresets,

      '/config/': SidebarConfig,
    },
    editLink: {
      pattern: 'https://github.com/unocss/unocss/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/unocss/unocss' },
      { icon: 'discord', link: 'https://chat.antfu.me' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-PRESENT Anthony Fu',
    },
  },
})
