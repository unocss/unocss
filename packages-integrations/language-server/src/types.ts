import type { UnocssPluginContext, UserConfig } from '@unocss/core'

export interface ServerSettings {
  languageIds: string[]
  root: string | string[] | undefined
  include: string | string[] | undefined
  exclude: string | string[] | undefined
  underline: boolean
  colorPreview: boolean
  colorPreviewRadius: string
  remToPxPreview: boolean
  remToPxRatio: number
  selectionStyle: boolean
  strictAnnotationMatch: boolean
  autocompleteMatchType: 'prefix' | 'fuzzy'
  autocompleteStrict: boolean
  autocompleteMaxItems: number
}

export const defaultSettings: ServerSettings = {
  languageIds: [],
  root: undefined,
  include: undefined,
  exclude: undefined,
  underline: true,
  colorPreview: true,
  colorPreviewRadius: '50%',
  remToPxPreview: true,
  remToPxRatio: 16,
  selectionStyle: true,
  strictAnnotationMatch: false,
  autocompleteMatchType: 'prefix',
  autocompleteStrict: false,
  autocompleteMaxItems: 1000,
}

export type UnoContext = UnocssPluginContext<UserConfig<any>>

export interface MatchedPosition {
  start: number
  end: number
  text: string
}
