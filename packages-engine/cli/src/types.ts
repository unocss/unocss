import type { CliEntryItem, UnocssPluginContext, UserConfig } from '@unocss/core'

/** Mark some properties as required, leaving others unchanged */
declare type MarkRequired<T, RK extends keyof T> = Exclude<T, RK> & Required<Pick<T, RK>>

interface CliGenericOptions {
  /**
   * Enable preflights
   */
  preflights?: boolean
  /**
   * Minify generated CSS
   */
  minify?: boolean
}

export interface CliOptions extends CliGenericOptions {
  /**
   * Current working directory
   *
   * @default process.cwd()
   */
  cwd?: string
  /**
   * Glob patterns to scan for files
   */
  patterns?: Array<string>
  /**
   * Output file path
   */
  outFile?: string
  /**
   * Watch mode to rebuild on change
   */
  watch?: boolean
  /**
   * UnoCSS config file path
   */
  config?: string
  /**
   * Output to standard output
   */
  stdout?: boolean
  /**
   * Update source files with transformed utilities
   */
  rewrite?: boolean
}

export interface ResolvedCliOptions extends Omit<MarkRequired<CliOptions, 'patterns' | 'cwd'>, 'config'> {
  entries: CliEntryItem[]
  configSources: string[]
  ctx: UnocssPluginContext<UserConfig<object>>
  config: UserConfig<object>
}
