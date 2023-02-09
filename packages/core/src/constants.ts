export const LAYER_DEFAULT = 'default'
export const LAYER_PREFLIGHTS = 'preflights'
export const LAYER_SHORTCUTS = 'shortcuts'

export const DEFAULT_LAYERS = {
  [LAYER_PREFLIGHTS]: -100,
  [LAYER_SHORTCUTS]: -10,
  [LAYER_DEFAULT]: 0,
}

export const DEFAULT_SEPARATORS = [':', '-']

export const DEFAULT_UNSORTED_PSEUDO_ELEMENTS = [
  '::-webkit-resizer',
  '::-webkit-scrollbar',
  '::-webkit-scrollbar-button',
  '::-webkit-scrollbar-corner',
  '::-webkit-scrollbar-thumb',
  '::-webkit-scrollbar-track',
  '::-webkit-scrollbar-track-piece',
  '::file-selector-button',
]
