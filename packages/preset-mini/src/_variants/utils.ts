export const PseudoClasses: Record<string, string> = Object.fromEntries([
  // pseudo elements part 1
  ['first-letter', '::first-letter'],
  ['first-line', '::first-line'],

  // location
  'any-link',
  'link',
  'visited',
  'target',
  ['open', '[open]'],

  // forms
  'default',
  'checked',
  'indeterminate',
  'placeholder-shown',
  'autofill',
  'optional',
  'required',
  'valid',
  'invalid',
  'user-valid',
  'user-invalid',
  'in-range',
  'out-of-range',
  'read-only',
  'read-write',

  // content
  'empty',

  // interactions
  'focus-within',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'enabled',
  'disabled',
  'popover-open',

  // tree-structural
  'root',
  'empty',
  ['even-of-type', ':nth-of-type(even)'],
  ['even', ':nth-child(even)'],
  ['odd-of-type', ':nth-of-type(odd)'],
  ['odd', ':nth-child(odd)'],
  'first-of-type',
  ['first', ':first-child'],
  'last-of-type',
  ['last', ':last-child'],
  'only-child',
  'only-of-type',

  // pseudo elements part 2
  ['backdrop-element', '::backdrop'],
  ['placeholder', '::placeholder'],
  ['before', '::before'],
  ['after', '::after'],
  ['file', '::file-selector-button'],
].map(key => Array.isArray(key) ? key : [key, `:${key}`]))

export const PseudoClassesKeys = Object.keys(PseudoClasses)

export const PseudoClassesColon: Record<string, string> = Object.fromEntries([
  ['backdrop', '::backdrop'],
].map(key => Array.isArray(key) ? key : [key, `:${key}`]))

export const PseudoClassesColonKeys = Object.keys(PseudoClassesColon)

export const PseudoClassFunctions = [
  'not',
  'is',
  'where',
  'has',
]

export const PseudoClassesMulti: Record<string, string[]> = Object.fromEntries([
  ['selection', ['::selection', ' *::selection']],
  ['marker', ['::marker', ' *::marker']],
])

export const PseudoClassesStr = Object.entries(PseudoClasses)
  .filter(([, pseudo]) => !pseudo.startsWith('::'))
  .map(([key]) => key)
  .sort((a, b) => b.length - a.length)
  .join('|')
export const PseudoClassesColonStr = Object.entries(PseudoClassesColon)
  .filter(([, pseudo]) => !pseudo.startsWith('::'))
  .map(([key]) => key)
  .sort((a, b) => b.length - a.length)
  .join('|')
export const PseudoClassFunctionsStr = PseudoClassFunctions.join('|')
const PseudoClassesMultiKeys = Object.keys(PseudoClassesMulti)
export const PseudoClassesMultiStr = PseudoClassesMultiKeys.sort((a, b) => b.length - a.length).join('|')

export const PseudoClassesStrRe = new RegExp([...PseudoClassesKeys, ...PseudoClassesColonKeys, ...PseudoClassFunctions, ...PseudoClassesMultiKeys].join('|'))
export function isPseudoClass(input: string) {
  return PseudoClassesStrRe.test(input)
}
