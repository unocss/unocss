import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress/types'
import { version } from '../../../package.json'

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
  { text: 'Compile class', link: '/transformers/compile-class' },
  { text: 'Attributify JSX', link: '/transformers/attributify-jsx' },
]

const Extractors: DefaultTheme.NavItemWithLink[] = [
  { text: 'Pug extractor', link: '/extractors/pug' },
  // { text: 'Svelte extractor', link: '/extractors/svelte' },
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
  { text: 'Interactive Docs', link: '/interactive/', target: '_blank' },
  { text: 'Playground', link: '/play/', target: '_blank' },
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

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = ({
  description,
  head: [
    ['meta', { name: 'og:description', content: description }],
  ],
  themeConfig: {
    nav: Nav,
    editLink: {
      pattern: 'https://github.com/unocss/unocss/docs/edit/main/docs/:path',
      text: 'Suggest changes to this page',
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
  },
})
