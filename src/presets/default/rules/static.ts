import { MiniwindRule } from '../../../types'

export const displays: MiniwindRule[] = [
  ['inline', { display: 'inline' }],
  ['block', { display: 'block' }],
  ['inline-block', { display: 'inline-block' }],
  ['table', { display: 'table' }],
  ['contents', { display: 'contents' }],
  ['flow-root', { display: 'flow-root' }],
  ['list-item', { display: 'list-item' }],
  ['hidden', { display: 'none' }],
]

export const appearances: MiniwindRule[] = [
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
  ['appearance-none', { appearance: 'none' }],
  ['visible', { visibility: 'visible' }],
  ['invisible', { visibility: 'hidden' }],
  ['backface-visible', { 'backface-visibility': 'visible' }],
  ['backface-hidden', { 'backface-visibility': 'hidden' }],
]

export const cursors: MiniwindRule[] = [
  [/^cursor-(.+)$/, ([, c]) => ({ cursor: c })],
]

export const pointerEvents: MiniwindRule[] = [
  ['pointer-events-none', { 'pointer-events': 'none' }],
  ['pointer-events-auto', { 'pointer-events': 'auto' }],
]

export const resizes: MiniwindRule[] = [
  ['resize-none', { resize: 'none' }],
  ['resize-x', { resize: 'horizontal' }],
  ['resize-y', { resize: 'vertical' }],
  ['resize', { resize: 'both' }],
]

export const userSelects: MiniwindRule[] = [
  ['select-none', { 'user-select': 'none' }],
  ['select-text', { 'user-select': 'text' }],
  ['select-all', { 'user-select': 'all' }],
  ['select-auto', { 'user-select': 'auto' }],
]

export const verticalAligns: MiniwindRule[] = [
  ['vertical-baseline', { 'vertical-align': 'baseline' }],
  ['vertical-top', { 'vertical-align': 'top' }],
  ['vertical-middle', { 'vertical-align': 'middle' }],
  ['vertical-text-top', { 'vertical-align': 'text-top' }],
  ['vertical-text-bottom', { 'vertical-align': 'text-bottom' }],
]

export const whitespaces: MiniwindRule[] = [
  ['whitespace-normal', { 'white-space': 'normal' }],
  ['whitespace-nowrap', { 'white-space': 'nowrap' }],
  ['whitespace-pre', { 'white-space': 'pre' }],
  ['whitespace-pre-line', { 'white-space': 'pre-line' }],
  ['whitespace-pre-wrap', { 'white-space': 'pre-wrap' }],
]

export const breaks: MiniwindRule[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-works', { 'overflow-wrap': 'break-word' }],
  ['break-all', { 'word-break': 'break-all' }],
]

export const textOverflows: MiniwindRule[] = [
  ['truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
  ['text-ellipsis', { 'text-overflow': 'ellipsis' }],
  ['text-clip', { 'text-overflow': 'clip' }],
]

export const textTransforms: MiniwindRule[] = [
  ['case-upper', { 'text-transform': 'uppercase' }],
  ['case-lower', { 'text-transform': 'lowercase' }],
  ['case-capital', { 'text-transform': 'capitalize' }],
  ['case-normal', { 'text-transform': 'none' }],
]

export const textDecorations: MiniwindRule[] = [
  ['underline', { 'text-decoration': 'underline' }],
  ['line-through', { 'text-decoration': 'line-through' }],
  ['no-underline', { 'text-decoration': 'none' }],
]

export const textAligns: MiniwindRule[] = [
  ['text-center', { 'text-align': 'center' }],
  ['text-left', { 'text-align': 'left' }],
  ['text-right', { 'text-align': 'right' }],
  ['text-justify', { 'text-align': 'justify' }],
]
