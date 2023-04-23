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
}

export interface Provider {
  name: WebFontsProviders
  getPreflight?(fonts: WebFontMeta[]): string
  getImportUrl?(fonts: WebFontMeta[]): string | undefined
  getFontName?(font: WebFontMeta): string
}
