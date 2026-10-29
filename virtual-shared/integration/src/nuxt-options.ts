import type { UserConfig } from '@unocss/core'
import type { AttributifyOptions } from '@unocss/preset-attributify'
import type { IconsOptions } from '@unocss/preset-icons'
import type { TagifyOptions } from '@unocss/preset-tagify'
import type { TypographyOptions } from '@unocss/preset-typography'
import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import type { PresetWind3Options } from '@unocss/preset-wind3'
import type { PresetWind4Options } from '@unocss/preset-wind4'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetTagify from '@unocss/preset-tagify'
import presetTypography from '@unocss/preset-typography'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'
import { defaultPipelineExclude } from './defaults'

/**
 * The Nuxt-specific UnoCSS options before they are expanded into presets.
 *
 * Shared by `@unocss/nuxt` (at runtime) and `@unocss/language-server` (when
 * resolving a `nuxt.config` file), so both apply exactly the same defaults.
 */
export interface NuxtUnoConfig extends UserConfig {
  /**
   * Enable attributify mode and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  attributify?: boolean | AttributifyOptions

  /**
   * Enable tagify mode and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  tagify?: boolean | TagifyOptions

  /**
   * Enable icons preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  icons?: boolean | IconsOptions

  /**
   * Enable web fonts preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  webFonts?: boolean | WebFontsOptions

  /**
   * Enable typography preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  typography?: boolean | TypographyOptions

  /**
   * Enable the wind3 preset
   * Only works when `presets` is not specified
   * @default true
   */
  wind3?: boolean | PresetWind3Options

  /**
   * Enable the wind4 preset
   * Only works when `presets` is not specified
   * @default false
   */
  wind4?: boolean | PresetWind4Options
}

/**
 * Expand the shorthand preset flags in `unocss` options (as used by
 * `nuxt.config`) into actual presets, mutating the given config.
 */
export function resolveNuxtOptions(options: NuxtUnoConfig) {
  if (options.wind3 && options.wind4) {
    console.warn('[unocss/nuxt]: wind3 and wind4 presets are mutually exclusive. wind3 will be disabled in favor of wind4.')
    options.wind3 = false
  }

  if (options.presets == null) {
    options.presets = []
    const presetMap = {
      wind3: presetWind3,
      wind4: presetWind4,
      attributify: presetAttributify,
      icons: presetIcons,
      webFonts: presetWebFonts,
      typography: presetTypography,
      tagify: presetTagify,
    }
    for (const [key, preset] of Object.entries(presetMap)) {
      const option = options[key as keyof NuxtUnoConfig]
      if (option) {
        options.presets.push(preset(typeof option === 'boolean' ? {} as any : option))
      }
    }
  }

  options.content ??= {}
  options.content.pipeline ??= {}
  if (options.content.pipeline !== false) {
    options.content.pipeline.exclude ??= defaultPipelineExclude
    if (Array.isArray(options.content.pipeline.exclude))
    // ignore macro files created by Nuxt
      options.content.pipeline.exclude.push(/\?macro=true/)
  }
}
