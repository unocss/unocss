import type { ParsedUtil, RawUtil, StringifiedUtil, SuggestionContext, Variant, VariantObject } from '../types'

export const attributifyRE = /^\[(.+?)~?="(.*)"\]$/
export const validateFilterRE = /(?!\d|-{2}|-\d)[a-zA-Z0-9\u00A0-\uFFFF-_:%-?]/
export const CONTROL_SHORTCUT_NO_MERGE = '$$shortcut-no-merge'

export function isAttributifySelector(selector: string) {
  return selector.match(attributifyRE)
}

export function isValidSelector(selector = ''): selector is string {
  return validateFilterRE.test(selector)
}

export function normalizeVariant(variant: Variant): VariantObject {
  return typeof variant === 'function'
    ? { match: variant }
    : variant
}

export function isRawUtil(util: ParsedUtil | RawUtil | StringifiedUtil): util is RawUtil {
  return util.length === 3
}

export function notNull<T>(value: T | null | undefined): value is T {
  return value != null
}

export class SuggestionBuilder<Theme extends {} = {}> {
  input: string
  context: SuggestionContext<Theme>
  prepend: string
  suggestions: string[] | undefined
  addtionallSuggestions: string[] = []
  invalid = false

  /**
   * NOTE: Every extended class needs to be able to
   * save and load it's state in `export` and `import`,
   * or the `withEither` method will not work.
   */
  constructor(input: string, context: SuggestionContext<Theme>, prepend = '') {
    this.input = input
    this.context = context
    this.prepend = prepend
  }

  export(): string {
    return JSON.stringify({
      input: this.input,
      prepend: this.prepend,
      suggestions: this.suggestions,
      addtionallSuggestions: this.addtionallSuggestions,
      invalid: this.invalid,
    })
  }

  import(data: string) {
    const { input, prepend, suggestions, addtionallSuggestions, invalid } = JSON.parse(data)
    this.input = input
    this.prepend = prepend
    this.suggestions = suggestions
    this.addtionallSuggestions = addtionallSuggestions
    this.invalid = invalid
  }

  notNeeded(): boolean {
    return !!this.suggestions?.length || this.invalid
  }

  setSuggestions(suggestions?: string[] | undefined) {
    if (!suggestions?.length)
      this.invalid = true
    else
      this.suggestions = suggestions
  }

  withStatic(str: string, trailing: 'none' | 'trailing' | 'both' = 'none'): this {
    if (this.notNeeded()) return this

    // if no input is given, suggest the static value
    if (!this.input) {
      this.setSuggestions([str])
      return this
    }

    // if trailing is allowed and the input starts with the string, prepend and continue
    if (trailing !== 'none' && this.input.startsWith(`${str}-`)) {
      this.input = this.input.slice(str.length + 1)
      this.prepend += `${str}-`
      return this
    }

    // if the static value starts with the input, suggest it
    if (str.startsWith(this.input)) {
      switch (trailing) {
        case 'none':
          this.setSuggestions([str])
          break
        case 'trailing':
          this.setSuggestions([`${str}-`])
          break
        case 'both':
          this.setSuggestions([str, `${str}-`])
          break
      }
    }
    // else the input is invalid
    else { this.setSuggestions() }

    return this
  }

  withMaybeStatic(str: string, trailing: 'none' | 'trailing' | 'both' = 'none'): this {
    if (this.notNeeded()) return this

    // if no input is given, suggest the static value as a additionall
    if (!this.input) {
      this.addtionallSuggestions.push(str)
      return this
    }

    // if trailing is allowed and the input starts with the string, prepend and continue
    if (trailing !== 'none' && this.input.startsWith(`${str}-`)) {
      this.input = this.input.slice(str.length + 1)
      this.prepend += `${str}-`
      return this
    }

    // if the static value starts with the input, suggest it
    if (str.startsWith(this.input)) {
      switch (trailing) {
        case 'none':
          this.addtionallSuggestions.push(str)
          break
        case 'trailing':
          this.addtionallSuggestions.push(`${str}-`)
          break
        case 'both':
          this.addtionallSuggestions.push(str, `${str}-`)
          break
      }
    }

    return this
  }

  withOptions(options: string[], trailingOptions?: string[] | true): this {
    if (this.notNeeded()) return this

    // setting the trailingOptions to true means that it's identical to options
    trailingOptions = trailingOptions === true ? options : trailingOptions

    const suggestions = [...options]
    if (trailingOptions)
      suggestions.push(...trailingOptions.map(i => `${i}-`))

    // if no input is given, suggest all options
    if (!this.input) {
      this.setSuggestions(suggestions)
      return this
    }

    // if the input starts with one of the trailing options, prepend and continue
    if (trailingOptions) {
      const prepend = trailingOptions.filter(i => this.input.startsWith(`${i}-`))[0]
      if (prepend) {
        this.input = this.input.slice(prepend.length + 1)
        this.prepend += `${prepend}-`
        return this
      }
    }

    // suggest the options that starts with the input
    const validOps = suggestions.filter(i => i.startsWith(this.input))
    this.setSuggestions(validOps)

    return this
  }

  withMaybeOptions(options: string[], trailingOptions?: string[] | true): this {
    if (this.notNeeded()) return this

    // setting the trailingOptions to true means that it's identical to options
    trailingOptions = trailingOptions === true ? options : trailingOptions

    const suggestions = [...options]
    if (trailingOptions)
      suggestions.push(...trailingOptions.map(i => `${i}-`))

    // if no input is given, suggest all options
    if (!this.input) {
      this.addtionallSuggestions.push(...suggestions)
      return this
    }

    // if the input starts with one of the trailing options, prepend and continue
    if (trailingOptions) {
      const prepend = trailingOptions.filter(i => this.input.startsWith(`${i}-`))[0]
      if (prepend) {
        this.input = this.input.slice(prepend.length + 1)
        this.prepend += `${prepend}-`
        return this
      }
    }

    // suggest the options that starts with the input
    const validOps = suggestions.filter(i => i.startsWith(this.input))
    this.addtionallSuggestions.push(...validOps)

    return this
  }

  withEither(cbs: ((builder: this) => this)[]): this {
    if (this.notNeeded()) return this

    // collected suggestions
    const suggestions = new Set<string>()
    // a snapshot of the current instance
    const prepend = this.prepend
    const snap = this.export()

    for (const cb of cbs) {
      // restore the instance
      this.import(snap)
      const builder = cb(this)
      const suggested = builder.collect().map(i => i.slice(prepend.length))
      for (const suggestion of suggested)
        suggestions.add(suggestion)
    }

    // restore the instance
    this.import(snap)

    this.setSuggestions(Array.from(suggestions))

    return this
  }

  collect(): string[] {
    if (this.invalid) return []

    const suggestions = new Set<string>()

    for (const i of this.addtionallSuggestions)
      suggestions.add(i)

    if (this.suggestions) {
      for (const i of this.suggestions)
        suggestions.add(i)
    }

    return Array.from(suggestions).map(i => this.prepend + i)
  }
}
