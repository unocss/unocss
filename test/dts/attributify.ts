import type {
  AttributifyAttributes,
  AttributifyAttributesWithNumericValues,
} from '@unocss/preset-attributify'

const defaultAttributes: AttributifyAttributes = {
  m: '2',
  'hover:bg': 'blue',
  // @ts-expect-error Numeric length-unit names are opt-in.
  m10px: '2',
}

const numericAttributes: AttributifyAttributesWithNumericValues = {
  m10px: '2',
}

void defaultAttributes
void numericAttributes
