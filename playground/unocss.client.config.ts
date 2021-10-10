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
  shortcuts: [
    // you could still have object style
    {
      btn: 'py-2 px-4 rounded-lg shadow-md',
    },
    // dynamic shortcuts
    [/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`],
  ],
})
