/** Mark some properties as required, leaving others unchanged */
declare type MarkRequired<T, RK extends keyof T> = Exclude<T, RK> & Required<Pick<T, RK>>

export type Options = {
  patterns?: Array<string>
  outFile?: string
  watch?: boolean
}

export type NormalizedOptions = MarkRequired<Options, 'patterns'>
