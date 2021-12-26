export interface GlyphsOptions {
  /**
   * Scale related to the current font size (1em).
   *
   * @default 1
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
