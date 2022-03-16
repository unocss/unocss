import type { AutoCompleteFunction } from '@unocss/core'
import { autocomplete as miniAutocomplete } from '@unocss/preset-mini'

export const autocomplete: AutoCompleteFunction[] = [
  ...miniAutocomplete,
]
