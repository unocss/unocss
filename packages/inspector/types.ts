import type { GenerateResult, ResolvedConfig } from '@unocss/core'

export interface ProjectInfo {
  version: string
  root: string
  modules: string[]
  config: ResolvedConfig
  configSources?: string[]
}

export interface Result extends Omit<GenerateResult, 'matched'> {
  matched: (Omit<MatchedSelector, 'modules'> & { modules: string[] })[]
  colors: (Omit<MatchedColor, 'modules'> & { modules: string[] })[]
}

export interface ModuleInfo extends Result {
  code: string
  id: string
  gzipSize: number
}

export interface OverviewInfo extends Result {
  gzipSize: number
  suggestedShortcuts: (Omit<SuggestedShortcut, 'modules'> & { modules: string[] })[]
}

export interface MatchedSelector {
  name: string
  rawSelector: string
  category: string
  count: number
  baseSelector?: string
  variants?: string[]
  modules: Set<string>
}

export interface MatchedColor {
  name: string
  no: string
  color: string
  count: number
  modules: Set<string>
}

export interface SuggestedShortcut {
  name: string
  selectors: string[]
  count: number
  modules: Set<string>
}
