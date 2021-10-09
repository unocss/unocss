import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  theme: {
    fontFamily: {
      sans: '\'Inter\', sans-serif',
      mono: '\'Fira Code\', monospace',
    },
  },
  presets: [
    presetAttributify({ strict: false }),
    presetUno(),
  ],
})
