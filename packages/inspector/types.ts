import type { GenerateResult, ResolvedConfig } from '@unocss/core'

export interface ProjectInfo<T> {
  version: string
  root: string
  modules: string[]
  config: ResolvedConfig<T>
  configSources?: string[]
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
