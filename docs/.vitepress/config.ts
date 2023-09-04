import { defineConfig } from 'vitepress'

export default defineConfig({
  outDir: './dist',
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
  locales: {
    root: {
      label: 'English',
      link: '/',
      ...(await import('./locales/en_US')).default,
    },
    zh_CN: {
      label: '中文简体',
      link: '/zh_CN/',
      ...(await import('./locales/zh_CN')).default,
    },
  },
})
