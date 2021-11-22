import { GenerateResult, ResolvedConfig } from '@unocss/core'

export interface ProjectInfo {
  version: string
  root: string
  modules: string[]
  configPath?: string
  config: ResolvedConfig
}

export interface Result extends Omit<GenerateResult, 'matched'> {
  matched: string[]
}

export interface ModuleInfo extends Result {
  code: string
  id: string
  gzipSize: number
}

export interface OverviewInfo extends Result {
  gzipSize: number
}
