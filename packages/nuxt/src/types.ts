import type { UserConfig } from '@unocss/core'
import type { PresetUnoOptions } from '@unocss/preset-uno'
import type { AttributifyOptions } from '@unocss/preset-attributify'
import type { IconsOptions } from '@unocss/preset-icons'
import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import type { TypographyOptions } from '@unocss/preset-typography'
import type { TagifyOptions } from '@unocss/preset-tagify'
import type { PresetWindOptions } from '@unocss/preset-wind'
import type { VitePluginConfig } from '@unocss/vite'

export interface UnocssNuxtOptions extends UserConfig {
  /**
   * CSS Generation mode. Only work with Vite.
   *
   * @see https://unocss.dev/integrations/vite#modes
   */
  mode?: VitePluginConfig['mode']

  /**
   * Injecting `uno.css` entry
   *
   * @default true
   */
  autoImport?: boolean

  /**
   * Injecting `@unocss/reset/tailwind.css` entry
   *
   * @default false
   */
  preflight?: boolean

  /**
   * Set Nuxt's `features.inlineStyle` to `false` by default to make it work with UnoCSS.
   *
   * @default true
   */
  disableNuxtInlineStyle?: boolean

  /**
   * Automatically merge UnoCSS configs from Nuxt layers.
   *
   * @default false
   */
  nuxtLayers?: boolean

  /**
   * Adjust the position of the `uno.css` injection. (Depends on `mode`)
   *
   * @default 'first'
   * @deprecated Temporarily removed, will be added back in the future.
   */
  injectPosition?: 'first' | 'last' | number | { after?: string }

  /**
   * Installing UnoCSS components
   * - `<UnoIcon>`
   *
   * @default true
   */
  components?: boolean

  /**
   * Enable the default preset
   * Only works when `presets` is not specified
   * @default true
   */
  uno?: boolean | PresetUnoOptions

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
   * Enable the wind preset
   * Only works when `presets` is not specified
   * @default false
   */
  wind?: boolean | PresetWindOptions
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    /**
     * When UnoCSS load config completed.
     */
    'unocss:config': (config: UserConfig) => void
  }
}
