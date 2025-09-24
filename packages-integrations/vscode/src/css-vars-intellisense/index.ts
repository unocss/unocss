import type { UnoGenerator } from '@unocss/core'
import type { MarkdownString } from 'vscode'
import type { ColorInfo, CompletionTooltip, ResolvedValues } from './types'
import { clearIntelliSenseCache, getCache } from './cache'
import { Formatter } from './formatter'
import { ValueResolver } from './resolver'

export { clearIntelliSenseCache }

/**
 * Provides advanced IntelliSense for UnoCSS presets that are heavily based on CSS variables.
 * It resolves CSS variables, calculates final values, and formats them for VS Code tooltips.
 */
export class CssVarsIntelliSenseService {
  private resolver: ValueResolver
  private cache: Map<string, ResolvedValues>

  constructor(private uno: UnoGenerator, private remToPxRatio: number) {
    this.resolver = new ValueResolver(uno, remToPxRatio)
    this.cache = getCache(uno)
  }

  private async resolve(util: string): Promise<ResolvedValues | null> {
    if (this.cache.has(util))
      return this.cache.get(util)!
    const result = await this.resolver.resolve(util)
    if (result)
      this.cache.set(util, result)
    return result
  }

  /**
   * Generates a tooltip for hovering over a utility.
   */
  async getHoverTooltip(util: string): Promise<MarkdownString | null> {
    const resolved = await this.resolve(util)
    return resolved ? Formatter.forHover(resolved) : null
  }

  /**
   * Generates a tooltip for a completion item.
   */
  async getCompletionTooltip(util: string): Promise<CompletionTooltip | null> {
    const resolved = await this.resolve(util)
    return resolved ? Formatter.forCompletion(resolved) : null
  }

  /**
   * Extracts color information from a utility.
   */
  async getColorInfo(util: string): Promise<ColorInfo | null> {
    const resolved = await this.resolve(util)
    return resolved?.colorInfo || null
  }

  /**
   * Checks if this advanced IntelliSense service is available for a given UnoGenerator instance
   * by looking for a `meta.cssVarsIntelliSense` flag in its presets.
   */
  static isAvailable(uno: UnoGenerator): boolean {
    return uno.config.presets.some(p => p.meta?.cssVarsIntelliSense === true)
  }
}
