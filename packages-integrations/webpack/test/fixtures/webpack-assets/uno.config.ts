import type { UserConfig } from '@unocss/core'
import presetMini from '@unocss/preset-mini'

export default {
  presets: [presetMini({ preflight: false })],
  safelist: ['text-red'],
} satisfies UserConfig
