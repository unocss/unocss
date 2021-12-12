import type { Rule } from '@unocss/core'
import { varEmpty } from '@unocss/preset-mini/rules'
import { CONTROL_BYPASS_PSEUDO } from '@unocss/preset-mini/variants'

const fontVariantNumericBase = {
  '--un-ordinal': varEmpty,
  '--un-slashed-zero': varEmpty,
  '--un-numeric-figure': varEmpty,
  '--un-numeric-spacing': varEmpty,
  '--un-numeric-fraction': varEmpty,
  'font-variant-numeric': 'var(--un-ordinal) var(--un-slashed-zero) var(--un-numeric-figure) var(--un-numeric-spacing) var(--un-numeric-fraction)',
  [CONTROL_BYPASS_PSEUDO]: '',
}

export const fontVariantNumeric: Rule[] = [
  [/^ordinal$/, () => [fontVariantNumericBase, { '--un-ordinal': 'ordinal' }]],
  [/^slashed-zero$/, () => [fontVariantNumericBase, { '--un-slashed-zero': 'slashed-zero' }]],
  [/^lining-nums$/, () => [fontVariantNumericBase, { '--un-numeric-figure': 'lining-nums' }]],
  [/^oldstyle-nums$/, () => [fontVariantNumericBase, { '--un-numeric-figure': 'oldstyle-nums' }]],
  [/^proportional-nums$/, () => [fontVariantNumericBase, { '--un-numeric-spacing': 'proportional-nums' }]],
  [/^tabular-nums$/, () => [fontVariantNumericBase, { '--un-numeric-spacing': 'tabular-nums' }]],
  [/^diagonal-fractions$/, () => [fontVariantNumericBase, { '--un-numeric-fraction': 'diagonal-fractions' }]],
  [/^stacked-fractions$/, () => [fontVariantNumericBase, { '--un-numeric-fraction': 'stacked-fractions' }]],
  ['normal-nums', { 'font-variant-numeric': 'normal' }],
]
