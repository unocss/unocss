import type { Connection, Disposable, TextDocuments } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { AutoCompleteMatchType } from '@unocss/autocomplete'
import type { createNanoEvents } from '@unocss/core/src/utils/events'
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

export interface LanguageServiceConfiguration {
  colorPreview: boolean
  languagesIds: string[]
  matchType: AutoCompleteMatchType
  maxItems: number
  remToPxPreview: boolean
  remToPxRatio: number
  underline: boolean
}

export type ConfigurationListenerMap<Init> = Map<keyof Init, WatchConfigurationHandler<Init, keyof Init>>

export type WatchConfigurationHandler<Init, K extends keyof Init> = (value: Init[K]) => void

export interface ConfigurationService<Config = LanguageServiceConfiguration> {
  configuration: Config
  watchChanged: <K extends keyof Config>(key: K | K[], fn: WatchConfigurationHandler<Config, K>) => () => void
  reload: () => Promise<void>
  onReady: (fn: (configuration: Config) => (void | Promise<void>)) => void
  dispose: () => void
  events: ReturnType<typeof createNanoEvents>
}

export interface LanguageServiceContext {
  contextLoader: ContextLoader
  connection: Connection
  documents: TextDocuments<TextDocument>
  logger: LanguageServiceLogger
  disposables: Disposable[]
  configuration: ConfigurationService['configuration']
  getDocument(uri: string): TextDocument | null
  watchConfigChanged: ConfigurationService['watchChanged']
  listen(): void
  dispose(): void
  use(...providers: LanguageServiceProvider[]): void
}

export type LanguageServiceProvider = (context: LanguageServiceContext) => void
