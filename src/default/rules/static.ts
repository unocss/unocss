import { NanowindRule } from '../../types'

export const displays: NanowindRule[] = [
  ['inline', { display: 'inline' }],
  ['block', { display: 'block' }],
  ['inline-block', { display: 'inline-block' }],
  ['grid', { display: 'grid' }],
  ['flex', { display: 'flex' }],
  ['table', { display: 'table' }],
  ['hidden', { display: 'none' }],
]

export const appearances: NanowindRule[] = [
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
  ['appearance-none', { appearance: 'none' }],
]

export const cursors: NanowindRule[] = [
  [/^cursor-(.+)$/, ([, c]) => ({ cursor: c })],
]

export const pointerEvents: NanowindRule[] = [
  ['pointer-events-none', { 'pointer-events': 'none' }],
  ['pointer-events-auto', { 'pointer-events': 'auto' }],
]

export const resizes: NanowindRule[] = [
  ['resize-none', { resize: 'none' }],
  ['resize-x', { resize: 'horizontal' }],
  ['resize-y', { resize: 'vertical' }],
  ['resize', { resize: 'both' }],
]

export const userSelects: NanowindRule[] = [
  ['select-none', { 'user-select': 'none' }],
  ['select-text', { 'user-select': 'text' }],
  ['select-all', { 'user-select': 'all' }],
  ['select-auto', { 'user-select': 'auto' }],
]

export const aligns: NanowindRule[] = [
  ['align-baseline', { 'vertical-align': 'baseline' }],
  ['align-top', { 'vertical-align': 'top' }],
  ['align-middle', { 'vertical-align': 'middle' }],
  ['align-text-top', { 'vertical-align': 'text-top' }],
  ['align-text-bottom', { 'vertical-align': 'text-bottom' }],
]

export const whitespaces: NanowindRule[] = [
  ['whitespace-normal', { 'white-space': 'normal' }],
  ['whitespace-nowrap', { 'white-space': 'nowrap' }],
  ['whitespace-pre', { 'white-space': 'pre' }],
  ['whitespace-pre-line', { 'white-space': 'pre-line' }],
  ['whitespace-pre-wrap', { 'white-space': 'pre-wrap' }],
]

export const breaks: NanowindRule[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-works', { 'overflow-wrap': 'break-word' }],
  ['break-all', { 'word-break': 'break-all' }],
]

export const textOverflows: NanowindRule[] = [
  ['truncate', {
    'overflow': 'hidden',
    'text-overflow': 'ellipsis',
    'white-space': 'nowrap',
  }],
  ['overflow-ellipsis', { 'text-overflow': 'ellipsis' }],
  ['overflow-clip', { 'text-overflow': 'clip' }],
]

export const textTransforms: NanowindRule[] = [
  ['uppercase', { 'text-transform': 'uppercase' }],
  ['lowercase', { 'text-transform': 'lowercase' }],
  ['capitalize', { 'text-transform': 'capitalize' }],
  ['normal-case', { 'text-transform': 'none' }],
]

export const textDecorations: NanowindRule[] = [
  ['underline', { 'text-decoration': 'underline' }],
  ['line-through', { 'text-decoration': 'line-through' }],
  ['no-underline', { 'text-decoration': 'none' }],
]

export const textAligns: NanowindRule[] = [
  ['text-center', { 'text-align': 'center' }],
  ['text-left', { 'text-align': 'left' }],
  ['text-right', { 'text-align': 'right' }],
  ['text-justify', { 'text-align': 'justify' }],
]
