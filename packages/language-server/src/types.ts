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
  events: ReturnType<typeof createNanoEvents>
  ready: Promise<Config>
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
  configReady: ConfigurationService['ready']
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
