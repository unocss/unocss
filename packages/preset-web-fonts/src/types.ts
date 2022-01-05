export type WebFontsProviders = 'google' | 'none'

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
   * Extend the theme object
   * @default true
   */
  extendTheme?: boolean

  /**
   * Key for the theme object
   *
   * @default 'fontFamily'
   */
  themeKey?: string
}

export interface Provider {
  name: WebFontsProviders
  getPreflight(fonts: WebFontMeta[]): string
  getFontName(font: WebFontMeta): string
}
