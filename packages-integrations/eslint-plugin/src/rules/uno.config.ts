// This file is for testing

import type { UserConfig } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'

export default {
  presets: [
    presetWind3(),
  ],
  blocklist: [
    'border',
    ['bg-red-500', { message: 'Use bg-red-600 instead' }],
    [i => i.startsWith('text-'), { message: 'Use color-* instead' }],
    [i => i.endsWith('-auto'), { message: s => `Use ${s.replace(/-auto$/, '-a')} instead` }],
  ],
} satisfies UserConfig
