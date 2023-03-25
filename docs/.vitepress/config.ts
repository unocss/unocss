import { defineConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress/types'

const nav: DefaultTheme.NavItem[] = [
  { text: 'Getting started', link: '/presets' },
  { text: 'Guide', link: 'preset-uno' },
  { text: 'Interactive Docs', link: 'https://uno.antfu.me/' },
  { text: 'Playground', link: 'https://uno.antfu.me/play/' },
]

const itemsConcepts: DefaultTheme.NavItemWithLink[] = [
  { text: 'Presets', link: '/presets' },
  { text: 'Rules', link: '/rules' },
  { text: 'Shortcuts', link: '/shortcuts' },
  { text: 'Variants', link: '/variants' },
  { text: 'Preflights', link: '/preflights' },
  { text: 'Style reset', link: '/style-reset' },
  { text: 'Extend theme', link: '/extend-theme' },
  { text: 'Layers', link: '/layers' },
]

const itemsInstallation: DefaultTheme.NavItemWithLink[] = [
  { text: 'Vite', link: '/vite' },
  { text: 'Nuxt', link: '/nuxt' },
  { text: 'Astro', link: '/astro' },
  { text: 'webpack', link: '/webpack' },
  { text: 'Next.js', link: '/next' },
  { text: 'Runtime', link: '/runtime' },
  { text: 'CLI', link: '/cli' },
  { text: 'VSCode extension', link: '/vscode-extension' },
]

const itemsPresets: DefaultTheme.NavItemWithLink[] = [
  { text: 'Uno', link: '/preset-uno' },
  { text: 'Wind', link: '/preset-wind' },
  { text: 'Mini', link: '/preset-mini' },
  { text: 'Web fonts', link: '/preset-web-fonts' },
  { text: 'Typography', link: '/preset-typography' },
  { text: 'Icons', link: '/preset-icons' },
  { text: 'Attributify', link: '/preset-attributify' },
  { text: 'Tagify', link: '/preset-tagify' },
  { text: 'rem-to-px', link: '/preset-rem-to-px' },
]

const itemsTransformers: DefaultTheme.NavItemWithLink[] = [
  { text: 'Variant group', link: '/transformer-variant-group' },
  { text: 'Directives', link: '/transformer-directives' },
  { text: 'Compile class', link: '/transformer-compile-class' },
  { text: 'Attributify JSX', link: '/transformer-attributify-jsx' },
]

const itemsOtherPackages: DefaultTheme.NavItemWithLink[] = [
  { text: 'Inspector', link: '/inspector' },
  { text: 'Core', link: '/core' },
  { text: 'Autocomplete', link: '/autocomplete' },
  { text: 'Reset', link: '/reset' },
  { text: 'Pug extractor', link: '/extractor-pug' },
]

function setSidebar(items: DefaultTheme.NavItemWithLink[], sidebarFunction: () => DefaultTheme.SidebarItem[]) {
  return Object.assign({}, ...items.map(item => ({
    [item.link]: sidebarFunction(),
  })))
}

function sidebarGettingStarted() {
  return <DefaultTheme.SidebarItem[]>[
    {
      text: 'Concepts',
      items: itemsConcepts,
    }, {
      text: 'Installation',
      items: itemsInstallation,
    },
  ]
}

function sidebarGuide() {
  return <DefaultTheme.SidebarItem[]>[
    {
      text: 'Presets',
      collapsed: false,
      items: itemsPresets,
    }, {
      text: 'Transformers',
      collapsed: false,
      items: itemsTransformers,
    }, {
      text: 'Other packages',
      collapsed: false,
      items: itemsOtherPackages,
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
  srcDir: './src',
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',
    nav,
    sidebar: {
      ...setSidebar([...itemsConcepts, ...itemsInstallation], sidebarGettingStarted),
      ...setSidebar([...itemsPresets, ...itemsTransformers, ...itemsOtherPackages], sidebarGuide),
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
