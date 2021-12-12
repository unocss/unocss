import presetUno from '@unocss/preset-uno'
import type { UserConfig } from '@unocss/core'

export const defaultConfig: UserConfig = {
  envMode: 'build',
  presets: [
    presetUno(),
  ],
}
