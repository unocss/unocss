import type { Connection, Disposable, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { AutoCompleteMatchType } from '@unocss/autocomplete'
import type { Emitter } from './integration'
import type { ContextLoader } from './contextLoader'

export interface LanguageServiceLogger {
  appendLine: (...args: any[]) => void
}
export interface LanguageContextOptions {
  autoListen?: boolean
  connection?: Connection
  contextLoader?: ContextLoader
  logger?: LanguageServiceLogger
}

export interface LanguageServiceContextEventsMap {
  configChanged: (changedKeys: Keys<LanguageServiceConfiguration>) => void
  serviceReady: () => void
}

export interface LanguageServiceConfiguration {
  colorPreview: boolean
  languagesIds: string[]
  matchType: AutoCompleteMatchType
  maxItems: number
  remToPxPreview: boolean
  remToPxRatio: number
  underline: boolean
}

export type Keys<Config> = (keyof Config)[]

export interface WatchChangedOptions {
  immediate?: boolean
}

export interface ConfigurationService<Config = LanguageServiceConfiguration> {
  configuration: Config
  watchChanged<K extends Keys<Config>>(
    key: [...K],
    handler: (config: Config) => void,
    options?: WatchChangedOptions
  ): () => void
  watchChanged<K extends keyof Config>(
    key: K,
    handler: (value: Config[K]) => void,
    options?: WatchChangedOptions
  ): () => void
  reload: () => Promise<void>
  dispose: () => void
  events: Emitter<LanguageServiceContextEventsMap>
  ready: Promise<Config>
}

export interface LanguageServiceContext {
  contextLoader: ContextLoader
  connection: Connection
  documents: TextDocuments<TextDocument>
  logger: LanguageServiceLogger
  disposables: Disposable[]
  configuration: ConfigurationService['configuration']
  events: Emitter<LanguageServiceContextEventsMap>
  getDocument(uri: string): TextDocument | null
  watchConfigChanged: ConfigurationService['watchChanged']
  listen(): void
  dispose(): void
  use(...providers: LanguageServiceProvider[]): void
}

export type LanguageServiceProvider = (context: LanguageServiceContext) => void

export type AnnotationEventParams = {
  uri: string
  underline: boolean
  annotations: {
    color?: string
    className: string
    css: string
    range: [number, number]
  }[]
} | {
  uri: null
  reason?: string
}
