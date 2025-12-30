import type { MarkdownString } from 'vscode'

/**
 * Information about a resolved color.
 */
export interface ColorInfo {
  original: string | null
  hex: string
  alpha: number | undefined
}

/**
 * A container for all computed values for a given utility.
 * This is the result of the resolver and the input for the formatter.
 */
export interface ResolvedValues {
  /** The fully computed CSS declarations (e.g., 'padding: 1rem;'). */
  computedCss: string
  /** The original CSS rule with added comments for clarity (rem to px, color hex, etc.). */
  commentedCss: string
  /** Any `@property` declarations associated with the utility. */
  propertyCss: string | null
  /** The original theme value that was resolved (e.g., 'oklch(...)'). */
  themeValue: string | null
  /** Detailed information about the resolved color, if any. */
  colorInfo: ColorInfo | null
  /** The CSS property associated with the color (e.g., 'background-color'). */
  colorProperty: string | null
  /** The definition of a shortcut if the utility is one (e.g., 'px-4 py-2'). */
  shortcutExpansion: string | null
}

/**
 * The final formatted tooltip content for VS Code's completion list.
 */
export interface CompletionTooltip {
  detail: string
  documentation: MarkdownString | string
}
