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

  /**
   * Update source files with transformed utilities (deprecated, use --rewrite)
   *
   * @deprecated use `rewrite` instead
   */
  writeTransformed?: boolean

  /**
   * Enable debug mode
   */
  debug?: boolean

  /**
   * Whether to output CSS files scanned from patterns to outFile
   *
   * - false: Do not output CSS files
   * - true: Transform and output scanned CSS file contents to outFile
   * - 'multi': Output each CSS file separately with filename format `${originFile}-[hash]`
   * - 'single': Merge multiple CSS files into one output file named `outFile-merged.css`
   *
   * @default false
   */
  splitCss?: boolean | 'multi' | 'single'

  /**
   * Switch wind3 or wind4 preset as default. If you have configured uno.config, this option will be ignored.
   */
  preset?: 'wind3' | 'wind4'
}

export interface ResolvedCliOptions extends Omit<MarkRequired<CliOptions, 'patterns' | 'cwd'>, 'config'> {
  entries: Required<CliEntryItem>[]
  ctx: UnocssPluginContext<UserConfig<object>>
}

export interface FileEntryItem {
  id: string
  code: string
  rewrite: boolean
  transformedCode?: string
}
