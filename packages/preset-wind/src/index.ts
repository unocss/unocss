import { definePreset } from '@unocss/core'
import type { PresetMiniOptions } from '@unocss/preset-mini'
import { presetMini } from '@unocss/preset-mini'

import { rules } from './rules'
import { shortcuts } from './shortcuts'
import { theme } from './theme'
import { variants } from './variants'
import { postprocessors } from './postprocessors'

export { colors, preflights } from '@unocss/preset-mini'
export type { Theme } from '@unocss/preset-mini'

export { rules, shortcuts, theme, variants }

export interface PresetWindOptions extends PresetMiniOptions {
  /**
   * The important option lets you control whether UnoCSS’s utilities should be marked with `!important`.
   *
   * This can be really useful when using UnoCSS with existing CSS that has high specificity selectors.
   *
   * You can also set `important` to a selector like `#app` instead, which will generate `#app :is(.m-1) { ... }`
   *
   * Also check out the compatibility with [:is()](https://caniuse.com/?search=%3Ais())
   *
   * @default false
   */
  important?: boolean | string
}

/**
 * The Tailwind CSS / Windi CSS compact preset for UnoCSS.
 *
 * @see https://unocss.dev/presets/wind
 */
export const presetWind = definePreset((options: PresetWindOptions = {}) => {
  options.important = options.important ?? false

  return {
    ...presetMini(options),
    name: '@unocss/preset-wind',
    theme,
    rules,
    shortcuts,
    variants: variants(options),
    postprocess: postprocessors(options),
  }
})

export default presetWind
