export type AutocompleteTemplatePart = AutocompleteTemplateStatic | AutocompleteTemplateGroup | AutocompleteTemplateDeepGroup

export interface AutocompleteTemplateStatic {
  type: 'static'
  value: string
}

export interface AutocompleteTemplateGroup {
  type: 'group'
  values: string[]
}

export interface ACTDeepGroupMember { [k: string]: ACTDeepGroupMember | string }

export interface AutocompleteTemplateDeepGroup {
  type: 'deepgroup'
  value: ACTDeepGroupMember
}

export interface ParsedAutocompleteTemplate {
  parts: AutocompleteTemplatePart[]
  suggest(input: string): string[] | undefined
}
