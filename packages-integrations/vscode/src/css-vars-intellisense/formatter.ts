import type { CompletionTooltip, ResolvedValues } from './types'
import parserCSS from 'prettier/parser-postcss'
import prettier from 'prettier/standalone'
import { MarkdownString } from 'vscode'
import { isHex } from './utils'

/**
 * Formats resolved CSS values into VS Code-compatible tooltips.
 */
export class Formatter {
  private static format(css: string): string {
    return prettier.format(css, { parser: 'css', plugins: [parserCSS] }).trim()
  }

  static forHover(resolved: ResolvedValues): MarkdownString {
    let cssToFormat = resolved.commentedCss
    if (resolved.shortcutExpansion)
      cssToFormat = `/* Shortcut: ${resolved.shortcutExpansion} */\n\n${cssToFormat}`

    let finalCss = this.format(cssToFormat)
    if (resolved.propertyCss) {
      const formattedProperties = this.format(resolved.propertyCss)
      finalCss += `\n\n/* Used properties */\n${formattedProperties}`
    }
    const markdown = new MarkdownString()
    markdown.appendCodeblock(finalCss, 'css')
    return markdown
  }

  static forCompletion(resolved: ResolvedValues): CompletionTooltip {
    const documentation = new MarkdownString()
    documentation.appendCodeblock(this.format(resolved.commentedCss), 'css')

    // 1. Priority for shortcuts
    if (resolved.shortcutExpansion) {
      return {
        detail: resolved.shortcutExpansion,
        documentation,
      }
    }

    // 2. Handle colors for regular utilities
    if (resolved.colorInfo) {
      const originalValue = resolved.themeValue
      const hex = resolved.colorInfo.hex
      const prefix = resolved.colorProperty ? `${resolved.colorProperty}: ` : ''
      let detail: string

      if (originalValue && !isHex(originalValue))
        detail = `${prefix}${originalValue} /* ${hex} */`
      else
        detail = `${prefix}${originalValue || hex}`

      // Overwrite documentation for colors to show the color swatch
      const colorDocumentation = new MarkdownString(hex)

      return {
        detail,
        documentation: colorDocumentation,
      }
    }

    // 3. Fallback for other regular utilities
    if (!resolved.computedCss)
      return { detail: 'utility', documentation }

    const formattedCss = this.format(`a { ${resolved.computedCss} }`)
    const detail = (formattedCss.match(/\{([\s\S]*)\}/)?.[1] || '').trim().replace(/\n\s*/g, ' ')

    return { detail, documentation }
  }
}
