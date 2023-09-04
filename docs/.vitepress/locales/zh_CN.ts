import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress/types'
import { version } from '../../../package.json'

const ogUrl = 'https://unocss.dev/'
const ogImage = `${ogUrl}og.png#1`
const title = 'UnoCSS'
const description = '即时按需的原子 CSS 引擎'

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: '开始使用', link: '/zh_CN/guide/' },
  { text: '为什么选择 UnoCSS?', link: '/zh_CN/guide/why' },
  { text: '预设', link: '/zh_CN/guide/presets' },
  { text: '样式重置', link: '/zh_CN/guide/style-reset' },
  { text: '配置文件', link: '/zh_CN/guide/config-file' },
  { text: '提取和安全列表', link: '/zh_CN/guide/extracting' },
]

const Configs: DefaultTheme.NavItemWithLink[] = [
  { text: '概述', link: '/zh_CN/config/' },
  { text: '规则', link: '/zh_CN/config/rules' },
  { text: '快捷方式', link: '/zh_CN/config/shortcuts' },
  { text: '主题', link: '/zh_CN/config/theme' },
  { text: '变体', link: '/zh_CN/config/variants' },
  { text: '检查器', link: '/zh_CN/config/extractors' },
  { text: '转换器', link: '/zh_CN/config/transformers' },
  { text: '预检', link: '/zh_CN/config/preflights' },
  { text: '层级', link: '/zh_CN/config/layers' },
  { text: '自动完成', link: '/zh_CN/config/autocomplete' },
  { text: '预设', link: '/zh_CN/config/presets' },
]

const Integrations: DefaultTheme.NavItemWithLink[] = [
  { text: 'Vite', link: '/zh_CN/integrations/vite' },
  { text: 'Nuxt', link: '/zh_CN/integrations/nuxt' },
  { text: 'Astro', link: '/zh_CN/integrations/astro' },
  { text: 'Svelte Scoped', link: '/zh_CN/integrations/svelte-scoped' },
  { text: 'Webpack', link: '/zh_CN/integrations/webpack' },
  { text: 'Runtime', link: '/zh_CN/integrations/runtime' },
  { text: 'CLI', link: '/zh_CN/integrations/cli' },
  { text: 'PostCSS', link: '/zh_CN/integrations/postcss' },
  { text: 'ESLint', link: '/zh_CN/integrations/eslint' },
  { text: 'VSCode 拓展', link: '/zh_CN/integrations/vscode' },
  { text: 'JetBrains IDE 插件', link: '/zh_CN/integrations/jetbrains' },
]

const Presets: DefaultTheme.NavItemWithLink[] = [
  { text: 'Uno (默认)', link: '/zh_CN/presets/uno' },
  { text: '图标', link: '/zh_CN/presets/icons' },
  { text: '属性化', link: '/zh_CN/presets/attributify' },
  { text: '字体', link: '/zh_CN/presets/typography' },
  { text: 'Web 字体', link: '/zh_CN/presets/web-fonts' },
  { text: 'Wind', link: '/zh_CN/presets/wind' },
  { text: 'Mini', link: '/zh_CN/presets/mini' },
  { text: '标签化', link: '/zh_CN/presets/tagify' },
  { text: 'Rem to px', link: '/zh_CN/presets/rem-to-px' },
]

const Transformers: DefaultTheme.NavItemWithLink[] = [
  { text: '变体组', link: '/zh_CN/transformers/variant-group' },
  { text: '指令', link: '/zh_CN/transformers/directives' },
  { text: '编译类', link: '/zh_CN/transformers/compile-class' },
  { text: 'JSX 属性', link: '/zh_CN/transformers/attributify-jsx' },
]

const Extractors: DefaultTheme.NavItemWithLink[] = [
  { text: 'Pug 提取器', link: '/zh_CN/extractors/pug' },
  { text: 'MDC 提取器', link: '/zh_CN/extractors/mdc' },
  { text: 'Svelte 提取器', link: '/zh_CN/extractors/svelte' },
  { text: '任意变体提取器', link: '/zh_CN/extractors/arbitrary-variants' },
]

const Tools: DefaultTheme.NavItemWithLink[] = [
  { text: '检查器', link: '/zh_CN/tools/inspector' },
  { text: '核心', link: '/zh_CN/tools/core' },
  { text: '自动完成', link: '/zh_CN/tools/autocomplete' },
]

const Nav: DefaultTheme.NavItem[] = [
  {
    text: '指南',
    items: [
      {
        text: '指南',
        items: Guides,
      },
    ],
    activeMatch: '^/guide/',
  },
  {
    text: '集成',
    items: [
      {
        text: '概述',
        link: '/zh_CN/integrations/',
      },
      {
        text: '集成',
        items: Integrations,
      },
      {
        text: '例子',
        link: '/zh_CN/integrations/#examples',
      },
    ],
    activeMatch: '^/integrations/',
  },
  {
    text: '配置',
    items: [
      {
        text: '配置文件',
        link: '/zh_CN/guide/config-file',
      },
      {
        text: '概念',
        items: Configs,
      },
    ],
    activeMatch: '^/config/',
  },
  {
    text: '预设',
    items: [
      {
        text: '概述',
        link: '/zh_CN/presets/',
      },
      {
        text: '社区预设',
        link: '/zh_CN/presets/community',
      },
      {
        text: '预设',
        items: Presets,
      },
      {
        text: '转换器',
        items: Transformers,
      },
      {
        text: '提取器',
        items: Extractors,
      },
    ],
    activeMatch: '^/(presets|transformers|extractors)/',
  },
  { text: '交互式文档', link: 'https://unocss.dev/interactive/', target: '_blank' },
  { text: '演练场', link: 'https://unocss.dev/play/', target: '_blank' },
  {
    text: `v${version}`,
    items: [
      {
        text: '发行说明',
        link: 'https://github.com/unocss/unocss/releases',
      },
      {
        text: '开始贡献',
        link: 'https://github.com/unocss/unocss/blob/main/CONTRIBUTING.md',
      },
    ],
  },
]

const SidebarGuide: DefaultTheme.SidebarItem[] = [
  {
    text: '指南',
    items: Guides,
  },
  {
    text: '集成',
    items: [
      {
        text: '概述',
        link: '/zh_CN/integrations/',
      },
      ...Integrations,
      {
        text: '例子',
        link: '/zh_CN/integrations/#examples',
      },
    ],
  },
  {
    text: '配置',
    link: '/zh_CN/config/',
  },
  {
    text: '预设',
    link: '/zh_CN/presets/',
  },
]

const SidebarPresets: DefaultTheme.SidebarItem[] = [
  {
    text: '概述',
    link: '/zh_CN/presets/',
  },
  {
    text: 'Presets',
    collapsed: false,
    items: Presets,
  },
  {
    text: '社区预设',
    link: '/zh_CN/presets/community',
  },
  {
    text: '转换器',
    collapsed: false,
    items: Transformers,
  },
  {
    text: '提取器',
    collapsed: false,
    items: Extractors,
  },
  {
    text: '其他包',
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
    link: '/zh_CN/guide/config-file',
  },
]

const config: LocaleSpecificConfig = {
  lang: 'zh-CN',
  title,
  titleTemplate: title,
  description,
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

  themeConfig: {
    logo: '/logo.svg',
    nav: Nav,
    search: {
      provider: 'local',
    },
    sidebar: {
      '/zh_CN/guide/': SidebarGuide,
      '/zh_CN/integrations/': SidebarGuide,

      '/zh_CN/tools/': SidebarPresets,
      '/zh_CN/presets/': SidebarPresets,
      '/zh_CN/transformers/': SidebarPresets,
      '/zh_CN/extractors/': SidebarPresets,

      '/zh_CN/config/': SidebarConfig,
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
}

export default config
