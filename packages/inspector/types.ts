import type { GenerateResult, ResolvedConfig } from '@unocss/core'

export interface ProjectInfo {
  version: string
  root: string
  modules: string[]
  config: ResolvedConfig
  configSources?: string[]
}

export interface Result extends Omit<GenerateResult, 'matched'> {
  matched: MatchedSelector[]
}

export interface ModuleInfo extends Result {
  code: string
  id: string
  gzipSize: number
}

export interface OverviewInfo extends Result {
  gzipSize: number
  suggestedShortcuts: SuggestedShortcut[]
}

export interface MatchedSelector {
  rawSelector: string
  category: string
  count: number
  baseSelector?: string
  variants?: string[]
}

export interface MatchedColor {
  name: string
  no: string
  color: string
  count: number
}

export interface SuggestedShortcut {
  selectors: string[]
  count: number
  modules: string[]
}
