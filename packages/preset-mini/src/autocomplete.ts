
import type { AutoCompleteTemplate } from '@unocss/core'

export const autocomplete: AutoCompleteTemplate[] = [
  '(border|b)-(rounded-|rd-)#num',
  '(border|b)-$colors',
  '(m|p)(x|y|t|b|l|r|s|e|)-#num',
  'text-$colors|fontSize',
  'font-$fontFamily',
  'font-(100|200|300|400|500|600|700)',
]
