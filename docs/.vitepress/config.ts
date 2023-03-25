import { defineConfig } from 'vitepress'

const nav = [
  { text: 'Getting started', link: '/presets' },
  { text: 'Guide', link: 'preset/uno' },
  { text: 'Reference', link: '/interactive' },
  { text: 'Playground', link: '/play' },
]

const itemsConcepts = [
  { text: 'Presets', link: '/presets' },
  { text: 'Rules', link: '/rules' },
  { text: 'Shortcuts', link: '/shortcuts' },
  { text: 'Variants', link: '/variants' },
  { text: 'Preflights', link: '/preflights' },
  { text: 'Style reset', link: '/style-reset' },
  { text: 'Extend theme', link: '/extend-theme' },
  { text: 'Layers', link: '/layers' },
]

const itemsInstallation = [
  { text: 'Vite', link: '/vite' },
  { text: 'Nuxt', link: '/nuxt' },
  { text: 'Astro', link: '/astro' },
  { text: 'webpack', link: '/webpack' },
  { text: 'Next.js', link: '/next' },
  { text: 'Runtime', link: '/runtime' },
  { text: 'CLI', link: '/cli' },
  { text: 'VSCode extension', link: '/vscode-extension' },
]

const itemsPresets = [
  { text: 'Uno', link: '/preset/uno' },
  { text: 'Wind', link: '/preset/wind' },
  { text: 'Mini', link: '/preset/mini' },
  { text: 'Web fonts', link: '/preset/web-fonts' },
  { text: 'Typography', link: '/preset/typography' },
  { text: 'Icons', link: '/preset/icons' },
  { text: 'Attributify', link: '/preset/attributify' },
  { text: 'Tagify', link: '/preset/tagify' },
  { text: 'rem-to-px', link: '/preset/rem-to-px' },
]

const itemsTransformers = [
  { text: 'Variant group', link: '/transformer/variant-group' },
  { text: 'Directives', link: '/transformer/directives' },
  { text: 'Compile class', link: '/transformer/compile-class' },
  { text: 'Attributify JSX', link: '/transformer/attributify-jsx' },
]

const itemsOtherPackages = [
  { text: 'Inspector', link: '/inspector' },
  { text: 'Core', link: '/core' },
  { text: 'Autocomplete', link: '/autocomplete' },
  { text: 'Reset', link: '/reset' },
  { text: 'Pug extractor', link: '/extractor-pug' },
]

function setSidebar(items, sidebarFunction) {
  return Object.assign({}, ...items.map(item => ({
    [item.link]: sidebarFunction(),
  })))
}

function sidebarGettingStarted() {
  return [
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
  return [
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
  title: 'UnoCSS',
  titleTemplate: 'UnoCSS',
  description: 'The instant on-demand Atomic CSS engine',
  head: [
    ['meta', { name: 'og:title', content: 'UnoCSS' }],
    ['meta', { property: 'og:image', content: '/cover/default.png' }],
  ],
  lang: 'en-US',
  srcDir: './src',
  cleanUrls: true,
  themeConfig: {
    logo: '/logo.svg',
    nav,
    sidebar: {
      ...setSidebar([...itemsConcepts, ...itemsInstallation], sidebarGettingStarted),
      ...setSidebar(itemsOtherPackages, sidebarGuide),
      '/preset/': sidebarGuide(),
      '/transformer/': sidebarGuide(),
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/unocss/unocss' },
      { icon: 'discord', link: 'http://chat.antfu.me' },
    ],
  },
})
