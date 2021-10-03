import { Rule } from '../../..'

const filterContnet = 'var(--mw-blur) var(--mw-brightness) var(--mw-contrast) var(--mw-grayscale) var(--mw-hue-rotate) var(--mw-invert) var(--mw-saturate) var(--mw-sepia) var(--mw-drop-shadow)'

const init = {
  '--mw-blur': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-brightness': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-contrast': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-grayscale': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-hue-rotate': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-invert': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-saturate': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-sepia': 'var(--mw-empty,/*!*/ /*!*/)',
  '--mw-drop-shadow': 'var(--mw-empty,/*!*/ /*!*/)',
  'filter': filterContnet,
}

export const filters: Rule[] = [
  ['filter', init],
  ['filter-none', { filter: 'none' }],
  [/^blur(?:-(\d+))?$/, ([, d]) => ({ '--mw-blur': `blur(${d}px)`, 'filter': filterContnet })],
]
