import type { Arrayable, Awaitable } from '@unocss/core'

export type WebFontsProviders = 'google' | 'bunny' | 'fontshare' | 'none' | Provider

export interface WebFontMeta {
  name: string
  weights?: (string | number)[]
  italic?: boolean
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
   * @default 'fontFamily'
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
  getPreflight?: (fonts: WebFontMeta[]) => string
  getImportUrl?: (fonts: WebFontMeta[]) => string | undefined
  getFontName?: (font: WebFontMeta) => string
}
