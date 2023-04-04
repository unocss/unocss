import { defineConfig } from 'vitepress'
import { enConfig } from './en'
import { sharedConfig } from './shared'

export default defineConfig({
  ...sharedConfig,

  locales: {
    root: { label: 'English', lang: 'en-US', link: '/', ...enConfig },
  },
})
