import type { UserConfig } from '@unocss/core'
import presetUno from '@unocss/preset-uno'

export const defaultConfig: UserConfig = {
  envMode: 'build',
  presets: [
    presetUno(),
  ],
}
