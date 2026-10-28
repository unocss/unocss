import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
  ],
  blocklist: [
    'border',
    ['bg-red-500', { message: 'Use bg-red-600 instead' }],
    [i => i.startsWith('text-'), { message: 'Use color-* instead' }],
    [i => i.endsWith('-auto'), { message: s => `Use ${s.replace(/-auto$/, '-a')} instead` }],
  ],
})
