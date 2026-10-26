import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
  content: { filesystem: ['**/*.html'] },
  presets: [
    presetMini({ preflight: false }),
    {
      name: 'inline-content',
      // make sure loader uses resolved content, not just raw config
      content: { inline: ['text-blue'] },
    },
  ],
  shortcuts: { 'my-shortcut': 'p-4' },
  rules: [['my-rule', { color: 'rebeccapurple' }, { layer: 'custom' }]],
})
