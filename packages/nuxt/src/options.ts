import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetTypography from '@unocss/preset-typography'
import presetWind from '@unocss/preset-wind'
import type { UnocssNuxtOptions } from './types'

export function resolveOptions(options: UnocssNuxtOptions) {
  if (options.presets == null) {
    options.presets = []
    if (options.uno)
      options.presets.push(presetUno(typeof options.uno === 'boolean' ? {} : options.uno))
    if (options.wind)
      options.presets.push(presetWind(typeof options.wind === 'boolean' ? {} : options.wind))
    if (options.attributify)
      options.presets.push(presetAttributify(typeof options.attributify === 'boolean' ? {} : options.attributify))
    if (options.icons)
      options.presets.push(presetIcons(typeof options.icons === 'boolean' ? {} : options.icons))
    if (options.webFonts)
      options.presets.push(presetWebFonts(typeof options.webFonts === 'boolean' ? {} : options.webFonts))
    if (options.typography)
      options.presets.push(presetTypography(typeof options.typography === 'boolean' ? {} : options.typography))
  }
}
