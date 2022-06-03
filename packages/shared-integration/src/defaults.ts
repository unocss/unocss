import type { UserConfigDefaults } from '@unocss/core'
import { cssIdRE } from '@unocss/core'
import presetUno from '@unocss/preset-uno'

export const defaultExclude = [cssIdRE]
export const defaultInclude = [/\.vue$/, /\.vue\?vue/, /\.svelte$/, /\.[jt]sx$/, /\.mdx?$/, /\.astro$/, /\.elm$/]

export const defaultUnocssConfig: UserConfigDefaults = {
  presets: [presetUno()],
}
