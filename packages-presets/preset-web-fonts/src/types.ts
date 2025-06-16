import type { Arrayable, Awaitable } from '@unocss/core'

export type WebFontsProviders = 'google' | 'bunny' | 'fontshare' | 'fontsource' | 'coollabs' | 'none' | Provider

export interface WebFontMeta {
  /**
   * The name of the font family
   * @example 'Fira Code'
   */
  name: string

  /**
   * Font weight(s) to include, and respect the weight order
   * @example [400, 700]
   */
  weights?: (string | number)[] // wght axis

  /**
   * Use italic style
   */
  italic?: boolean // ital axis

  /**
   * Variable font settings
   * @example
   * ```ts
   * variable: {
   *   wght: { default: '400', min: '100', max: '900', step: '100' },
   *   wdth: { default: '100', min: '50', max: '200', step: '10' },
   *   slnt: { default: '0', min: '-20', max: '20', step: '1' },
   * }
   */
  variable?: Record<string, Partial<Axes>> // variable font

  /**
   * The font subsets to include
   * @example ['latin', 'cyrillic']
   */
  subsets?: string[]

  /**
   * Prefer static font files over variable
   */
  preferStatic?: boolean

  /**
   * Override the provider
   * @default <matches root config>
   */
  provider?: WebFontsProviders
}

export interface WebFontProcessor {
  getCSS?: (
    fonts: ResolvedWebFontMeta[],
    providers: Provider[],
    getCSSDefault: (
      fonts: ResolvedWebFontMeta[],
      providers: Provider[],
    ) => Awaitable<string>
  ) => Awaitable<string | undefined>
  transformCSS?: (css: string) => Promise<string | undefined>
}

export interface ResolvedWebFontMeta extends Omit<WebFontMeta, 'provider'> {
  provider: Provider
}

export interface WebFontsOptions {
  /**
   * Provider service of the web fonts
   * @default 'google'
   */
  provider?: WebFontsProviders

  /**
   * The fonts
   */
  fonts?: Record<string, WebFontMeta | string | (WebFontMeta | string)[]>

  /**
   * Extend fonts to the theme object
   * @default true
   */
  extendTheme?: boolean

  /**
   * Key for the theme object
   *
   * Automatically detect the key based on the preset used
   *
   * @default
   * `preset-wind3` -> 'fontFamily'
   * `preset-wind4` -> 'font'
   */
  themeKey?: string

  /**
   * Inline CSS @import()
   *
   * @default true
   */
  inlineImports?: boolean

  /**
   * Custom fetch function
   *
   * @default undefined
   */
  customFetch?: (url: string) => Promise<any>

  /**
   * Custom processor for the font CSS
   */
  processors?: Arrayable<WebFontProcessor>

  /**
   * Timeouts for fetching web fonts
   */
  timeouts?: false | {
    /**
     * Timeout for printing warning message
     *
     * @default 500
     */
    warning?: number
    /**
     * Timeout for failing the fetch
     *
     * @default 2000
     */
    failure?: number
  }
}

export interface Provider {
  name: WebFontsProviders
  getPreflight?: (fonts: WebFontMeta[]) => Awaitable<string | undefined>
  getImportUrl?: (fonts: WebFontMeta[]) => string | undefined
  getFontName?: (font: WebFontMeta) => string
}

export interface Axes {
  default: string
  min: string
  max: string
  step: string
}
