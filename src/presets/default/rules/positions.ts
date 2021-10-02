import { MiniwindRule } from '../../../types'
import { h } from '../../../utils'

export const positions: MiniwindRule[] = [
  ['relative', { position: 'relative' }],
  ['absolute', { position: 'absolute' }],
  ['fixed', { position: 'fixed' }],
]

export const justifies: MiniwindRule[] = [
  ['justify-start', {
    '-webkit-box-pack': 'start',
    '-ms-flex-pack': 'start',
    '-webkit-justify-content': 'flex-start',
    'justify-content': 'flex-start',
  }],
  ['justify-end', {
    '-webkit-box-pack': 'end',
    '-ms-flex-pack': 'end',
    '-webkit-justify-content': 'flex-end',
    'justify-content': 'flex-end',
  }],
  ['justify-center', {
    '-webkit-box-pack': 'center',
    '-ms-flex-pack': 'center',
    '-webkit-justify-content': 'center',
    'justify-content': 'center',
  }],
  ['justify-between', {
    '-webkit-box-pack': 'justify',
    '-ms-flex-pack': 'justify',
    '-webkit-justify-content': 'space-between',
    'justify-content': 'space-between',
  }],
  ['justify-around', {
    '-ms-flex-pack': 'distribute',
    '-webkit-justify-content': 'space-around',
    'justify-content': 'space-around',
  }],
  ['justify-evenly', {
    '-ms-flex-pack': 'space-evenly',
    '-webkit-justify-content': 'space-evenly',
    'justify-content': 'space-evenly',
  }],
]

export const justifyItems: MiniwindRule[] = [
  // TODO: https://windicss.org/utilities/positioning.html#justify-items
]

export const justifySelfs: MiniwindRule[] = [
  // TODO: https://windicss.org/utilities/positioning.html#justify-items
]

export const alignContents: MiniwindRule[] = [
  // TODO:
]

export const alignItems: MiniwindRule[] = [
  // TODO:
]

export const alignSelfs: MiniwindRule[] = [
  // TODO:
]

export const placeContents: MiniwindRule[] = [
  // TODO:
]

export const placeItems: MiniwindRule[] = [
  // TODO:
]

export const placeSelfs: MiniwindRule[] = [
  // TODO:
]

export const insets: MiniwindRule[] = [
  // TODO:
]

export const floats: MiniwindRule[] = [
  [/^float-(left|right|none)$/, ([, value]) => ({ float: value })],
  [/^clear-(left|right|both|none)$/, ([, value]) => ({ clear: value })],
]

export const zIndexes: MiniwindRule[] = [
  ['z-auto', { 'z-index': 'auto' }],
  [/^z-([^-]+)$/, ([, v]) => ({ 'z-index': h.number(v) })],
]
