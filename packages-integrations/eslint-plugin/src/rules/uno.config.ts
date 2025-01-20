// This file is for testing

// eslint-disable-next-line no-restricted-imports
import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  blocklist: [
    'border',
    ['bg-red-500', { message: 'Use bg-red-600 instead' }],
    [i => i.startsWith('text-'), { message: 'Use color-* instead' }],
    [i => i.endsWith('-auto'), { message: s => `Use ${s.replace(/-auto$/, '-a')} instead` }],
  ],
})
