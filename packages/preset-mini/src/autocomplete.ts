
import type { AutoCompleteFunction } from '@unocss/core'

export const autocomplete: AutoCompleteFunction[] = [
  (input) => {
    // TODO:
    return [`inject-${input}`]
  },
]
