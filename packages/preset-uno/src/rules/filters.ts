import { Rule } from 'unocss'

const filterContnet = 'var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia) var(--un-drop-shadow)'

const init = {
  '--un-blur': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-brightness': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-contrast': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-grayscale': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-hue-rotate': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-invert': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-saturate': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-sepia': 'var(--un-empty,/*!*/ /*!*/)',
  '--un-drop-shadow': 'var(--un-empty,/*!*/ /*!*/)',
  'filter': filterContnet,
}

export const filters: Rule[] = [
  ['filter', init],
  ['filter-none', { filter: 'none' }],
  [/^blur(?:-(\d+))?$/, ([, d]) => ({ '--un-blur': `blur(${d}px)`, 'filter': filterContnet })],
  ['invert', { '--un-invert': 'invert(100%)' }],
]
