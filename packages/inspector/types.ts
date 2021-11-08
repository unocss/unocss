import { GenerateResult, UserConfig } from '@unocss/core'

export interface ProjectInfo {
  root: string
  modules: string[]
  configPath?: string
  config: UserConfig
}

export interface ModuleInfo extends Omit<GenerateResult, 'matched'> {
  code: string
  id: string
  matched: string[]
}
