import type { AutoCompleteFunction, SuggestResult } from '@unocss/core'
import type { LRUCache } from 'lru-cache'
import type { AutocompleteParseError } from './parse'

export type AutoCompleteMatchType = 'prefix' | 'fuzzy'

export interface AutocompleteOptions {
  matchType?: AutoCompleteMatchType
  throwErrors?: boolean
}

export type AutocompleteTemplatePart = AutocompleteTemplateStatic | AutocompleteTemplateGroup | AutocompleteTemplateTheme

export interface AutocompleteTemplateStatic {
  type: 'static'
  value: string
}

export interface AutocompleteTemplateGroup {
  type: 'group'
  values: string[]
}

export interface AutocompleteTemplateTheme {
  type: 'theme'
  objects: Record<string, unknown>[]
}

export interface ParsedAutocompleteTemplate {
  parts: AutocompleteTemplatePart[]
  suggest: (input: string, matchType?: AutoCompleteMatchType) => string[] | undefined
  errors: AutocompleteParseError[]
}

export interface UnocssAutocomplete {
  suggest: (input: string, allowsEmptyInput?: boolean) => Promise<string[]>
  suggestInFile: (content: string, cursor: number) => Promise<SuggestResult | undefined>
  templates: (string | AutoCompleteFunction)[]
  cache: LRUCache<string, string[]>
  errorCache: Map<string, AutocompleteParseError[]>
  reset: () => void
  enumerate: () => Promise<Set<string>>
}
