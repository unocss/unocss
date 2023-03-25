import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress/types'

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: 'Presets', link: '/guide/presets' },
  { text: 'Rules', link: '/guide/rules' },
  { text: 'Shortcuts', link: '/guide/shortcuts' },
  { text: 'Variants', link: '/guide/variants' },
  { text: 'Preflights', link: '/guide/preflights' },
  { text: 'Style reset', link: '/guide/style-reset' },
  { text: 'Extend theme', link: '/guide/extend-theme' },
  { text: 'Layers', link: '/guide/layers' },
]

const Integrations: DefaultTheme.NavItemWithLink[] = [
  { text: 'Vite', link: '/integrations/vite' },
  { text: 'Nuxt', link: '/integrations/nuxt' },
  { text: 'Astro', link: '/integrations/astro' },
  { text: 'webpack', link: '/integrations/webpack' },
  { text: 'Next.js', link: '/integrations/next' },
  { text: 'Runtime', link: '/integrations/runtime' },
  { text: 'CLI', link: '/integrations/cli' },
  { text: 'VSCode extension', link: '/integrations/vscode' },
]

const Presets: DefaultTheme.NavItemWithLink[] = [
  { text: 'Uno', link: '/presets/uno' },
  { text: 'Wind', link: '/presets/wind' },
  { text: 'Mini', link: '/presets/mini' },
  { text: 'Web fonts', link: '/presets/web-fonts' },
  { text: 'Typography', link: '/presets/typography' },
  { text: 'Icons', link: '/presets/icons' },
  { text: 'Attributify', link: '/presets/attributify' },
  { text: 'Tagify', link: '/presets/tagify' },
  { text: 'rem-to-px', link: '/presets/rem-to-px' },
]

const Transformers: DefaultTheme.NavItemWithLink[] = [
  { text: 'Variant group', link: '/transformer-s/variant-group' },
  { text: 'Directives', link: '/transformers/directives' },
  { text: 'Compile class', link: '/transformers/compile-class' },
  { text: 'Attributify JSX', link: '/transformers/attributify-jsx' },
]

const Extractors: DefaultTheme.NavItemWithLink[] = [
  { text: 'Pug extractor', link: '/extractors/pug' },
]

const Tools: DefaultTheme.NavItemWithLink[] = [
  { text: 'Inspector', link: '/tools/inspector' },
  { text: 'Core', link: '/tools/core' },
  { text: 'Autocomplete', link: '/tools/autocomplete' },
  { text: 'Reset', link: '/tools/reset' },
]

const Nav: DefaultTheme.NavItem[] = [
  { text: 'Guide', items: Guides },
  { text: 'Presets', items: Presets },
  { text: 'Interactive Docs', link: 'https://uno.antfu.me/', target: '_blank' },
  { text: 'Playground', link: 'https://uno.antfu.me/play/', target: '_blank' },
]

function setSidebar(items: DefaultTheme.NavItemWithLink[], sidebarFunction: () => DefaultTheme.SidebarItem[]) {
  return Object.assign({}, ...items.map(item => ({
    [item.link]: sidebarFunction(),
  })))
}

function sidebarGettingStarted() {
  return <DefaultTheme.SidebarItem[]>[
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
      items: Presets,
    },
  ]
}

function sidebarGuide() {
  return <DefaultTheme.SidebarItem[]>[
    {
      text: 'Presets',
      collapsed: false,
      items: Presets,
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
}

export default defineConfig({
  lang: 'en-US',
  title: 'UnoCSS',
  titleTemplate: 'UnoCSS',
  description: 'The instant on-demand Atomic CSS engine',
  head: [
    ['meta', { name: 'og:title', content: 'UnoCSS' }],
    ['meta', { property: 'og:image', content: '/cover/default.png' }],
  ],
  srcDir: '.',
  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    nav: Nav,
    sidebar: {
      ...setSidebar([...Guides, ...Integrations], sidebarGettingStarted),
      ...setSidebar([...Presets, ...Transformers, ...Tools], sidebarGuide),
    },
    editLink: {
      pattern: 'https://github.com/unocss/unocss/docs/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/unocss/unocss' },
      { icon: 'discord', link: 'http://chat.antfu.me' },
    ],
  },
})
