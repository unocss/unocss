export interface GlyphsOptions {
  /**
   * List of font and its path.
   *
   */
  fonts?: Record<string, string>
  /**
   * Class prefix for matching glyph rules.
   *
   * @default `g-`
   */
  prefix?: string
  /**
   * Emit warning when font/glyph cannot be resolved.
   *
   * @default false
   */
  warn?: boolean
  /**
   * Rule layer
   *
   * @default 'glyphs'
   */
  layer?: string
}
