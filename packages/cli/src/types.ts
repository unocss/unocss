/** Mark some properties as required, leaving others unchanged */
declare type MarkRequired<T, RK extends keyof T> = Exclude<T, RK> & Required<Pick<T, RK>>

export interface CliOptions {
  cwd?: string
  patterns?: Array<string>
  outFile?: string
  watch?: boolean
  config?: string

  // generate options
  preflights?: boolean
  minify?: boolean
}

export type ResolvedCliOptions = MarkRequired<CliOptions, 'patterns'>
