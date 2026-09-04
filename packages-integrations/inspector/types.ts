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
  variants?: string[]
  modules: string[]
  body: string
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
