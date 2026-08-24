import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
  presets: [presetMini({preflight: false})],
  safelist: ['text-red'],
})
