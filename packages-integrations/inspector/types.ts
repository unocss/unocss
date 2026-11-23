import type { ResolvedConfig, RuleMeta } from '@unocss/core'

export interface ProjectInfo {
  version: string
  root: string
  modules: string[]
  config: ResolvedConfig
  configSources?: string[]
  configPath?: string
}

export interface Result {
  css: string
  matched: (Omit<MatchedSelector, 'modules'> & { modules: string[] })[]
  icons: (Omit<MatchedSelector, 'modules'> & { modules: string[] })[]
  colors: (Omit<MatchedColor, 'modules'> & { modules: string[] })[]
  layers: { name: string, css: string }[]
}

export interface ModuleInfo extends Result {
  code: string
  id: string
  gzipSize: number
}

export interface OverviewInfo extends Result {
  gzipSize: number
}

export interface ReplResult {
  css: string
  matched: string[]
}

/**
 * How a utility was produced: a shortcut expansion, a variant chain, or a
 * static/dynamic (regex) rule.
 */
export type DocsItemKind = 'shortcut' | 'variant' | 'static' | 'dynamic'

export interface DocsSearchItem {
  class: string
  /**
   * CSS declarations the utility generates, `prop: value; ` joined.
   */
  body: string
  kind: DocsItemKind
  /**
   * First color found in the generated CSS, for the result swatch.
   */
  color?: string
}

export interface DocsRuleSource {
  /**
   * The rule matcher: a static class name or a stringified RegExp.
   */
  matcher: string
  static: boolean
  /**
   * Name of the preset that ships the rule; `undefined` for rules defined in
   * the project config itself.
   */
  preset?: string
}

export interface DocsShortcutSource {
  from: string
  to: string
}

export interface DocsVariantStep {
  name?: string
  preset?: string
  /**
   * Selector after this step, handed to the next round of matching.
   */
  result: string
}

export interface DocsItem extends DocsSearchItem {
  css: string
  layers: string[]
  colors: string[]
  /**
   * Standard CSS properties set by the utility.
   */
  properties: string[]
  rules: DocsRuleSource[]
  shortcuts: DocsShortcutSource[]
  variants: DocsVariantStep[]
  /**
   * Other known utilities generating the same CSS body.
   */
  aliases: string[]
  /**
   * Other known utilities matched by the same rules.
   */
  sameRule: string[]
}

export interface ModuleUpdate {
  path: string
}

/**
 * Reactive change signal shared from server to client (devframe shared
 * state). Every extraction/config change bumps `revision`; `module` carries
 * the path of the last hot-updated module (empty for project-wide changes).
 */
export interface InspectorChanges {
  revision: number
  module: string
}

export interface MatchedSelector {
  name: string
  rawSelector: string
  category: string
  count: number
  ruleMeta?: RuleMeta
  baseSelector?: string
  collection?: string
  variants?: string[]
  modules: string[]
  body: string
  /**
   * CSS declarations the utility generates, independent of its selector and variants.
   * Utilities with equal declarations are aliases of each other.
   */
  declarations?: string
  alias?: Record<string, number>
}

export interface MatchedColor extends MatchedSelector {
  no: string
  color: string
}

export interface SuggestedShortcut {
  name: string
  selectors: string[]
  count: number
  modules: string[]
}
