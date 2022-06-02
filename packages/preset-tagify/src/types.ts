export interface TagifyOptions {
  /**
   * The prefix to use for the tagify variant.
   */
  prefix?: string

  /**
   * Tags excluded from processing.
   * @default ['b', /^h\d+$/, 'table']
   */
  excludedTags?: (string | RegExp)[]

  /**
   * Extra CSS properties to apply to matched rules
   */
  extraProperties?:
  | Record<string, string>
  | ((matched: string) => Partial<Record<string, string>>)

  /**
   * Enable default extractor
   * @default true
   */
  defaultExtractor?: boolean
}
