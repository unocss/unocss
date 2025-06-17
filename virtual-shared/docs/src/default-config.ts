import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
} from 'unocss'

export default defineConfig({
  rules: [
    ['custom-rule', { color: 'red' }],
  ],
  shortcuts: {
    'custom-shortcut': 'text-lg text-orange hover:text-teal',
  },
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
})
