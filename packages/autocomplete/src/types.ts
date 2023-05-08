import type { AutoCompleteFunction, SuggestResult } from '@unocss/core'
import type { LRUCache } from 'lru-cache'

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
  suggest(input: string): string[] | undefined
}

export interface UnocssAutocomplete {
  suggest: (input: string) => Promise<string[]>
  suggestInFile: (content: string, cursor: number) => Promise<SuggestResult>
  templates: (string | AutoCompleteFunction)[]
  cache: LRUCache<string, string[]>
  reset: () => void
  enumerate: () => Promise<Set<string>>
}
