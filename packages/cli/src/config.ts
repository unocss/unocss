import type { Theme } from '@unocss/preset-uno'
import presetUno from '@unocss/preset-uno'
import type { UserConfig } from '@unocss/core'

export const defaultConfig: UserConfig<Theme> = {
  envMode: 'build',
  presets: [
    presetUno(),
  ],
}
