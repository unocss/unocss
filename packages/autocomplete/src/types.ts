export type AutocompleteTemplatePart = AutocompleteTemplateStatic | AutocompleteTemplateGroup

export interface AutocompleteTemplateStatic {
  type: 'static'
  value: string
}

export interface AutocompleteTemplateGroup {
  type: 'group'
  values: string[]
}

export interface ParsedAutocompleteTemplate {
  parts: AutocompleteTemplatePart[]
  suggest(input: string): string[] | undefined
}
