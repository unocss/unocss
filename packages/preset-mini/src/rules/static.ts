import type { Rule } from '@unocss/core'
import { globalKeywords, handler as h, makeGlobalStaticRules } from '../utils'

export const varEmpty = 'var(--un-empty,/*!*/ /*!*/)'

// display table included on table.ts
export const displays: Rule[] = [
  ['inline', { display: 'inline' }],
  ['block', { display: 'block' }],
  ['inline-block', { display: 'inline-block' }],
  ['contents', { display: 'contents' }],
  ['flow-root', { display: 'flow-root' }],
  ['list-item', { display: 'list-item' }],
  ['hidden', { display: 'none' }],
  [/^display-(.+)$/, ([, c]) => ({ display: h.bracket.cssvar.global(c) || c })],
]

export const appearances: Rule[] = [
  ['visible', { visibility: 'visible' }],
  ['invisible', { visibility: 'hidden' }],
  ['backface-visible', { 'backface-visibility': 'visible' }],
  ['backface-hidden', { 'backface-visibility': 'hidden' }],
  ...makeGlobalStaticRules('backface', 'backface-visibility'),
]

export const cursors: Rule[] = [
  [/^cursor-(.+)$/, ([, c]) => ({ cursor: h.bracket.cssvar.global(c) || c })],
]

export const pointerEvents: Rule[] = [
  ['pointer-events-auto', { 'pointer-events': 'auto' }],
  ['pointer-events-none', { 'pointer-events': 'none' }],
  ...makeGlobalStaticRules('pointer-events'),
]

export const resizes: Rule[] = [
  ['resize-x', { resize: 'horizontal' }],
  ['resize-y', { resize: 'vertical' }],
  ['resize', { resize: 'both' }],
  ['resize-none', { resize: 'none' }],
  ...makeGlobalStaticRules('resize'),
]

export const userSelects: Rule[] = [
  ['select-auto', { 'user-select': 'auto' }],
  ['select-all', { 'user-select': 'all' }],
  ['select-text', { 'user-select': 'text' }],
  ['select-none', { 'user-select': 'none' }],
  ...makeGlobalStaticRules('select', 'user-select'),
]

export const whitespaces: Rule[] = [
  [
    /^(?:whitespace-|ws-)([-\w]+)$/,
    ([, v]) => ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces', ...globalKeywords].includes(v) ? { 'white-space': v } : undefined,
    { autocomplete: '(whitespace|ws)-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces)' },
  ],
]

export const contents: Rule[] = [
  [/^content-\[(.+)\]$/, ([, v]) => ({ content: `"${v}"` })],
  [/^content-(\$.+)]$/, ([, v]) => ({ content: h.cssvar(v) })],
  ['content-empty', { content: '""' }],
  ['content-none', { content: '""' }],
]

export const breaks: Rule[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-words', { 'overflow-wrap': 'break-word' }],
  ['break-all', { 'word-break': 'break-all' }],
]

export const textOverflows: Rule[] = [
  ['truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
  ['text-ellipsis', { 'text-overflow': 'ellipsis' }],
  ['text-clip', { 'text-overflow': 'clip' }],
]

export const textTransforms: Rule[] = [
  ['case-upper', { 'text-transform': 'uppercase' }],
  ['case-lower', { 'text-transform': 'lowercase' }],
  ['case-capital', { 'text-transform': 'capitalize' }],
  ['case-normal', { 'text-transform': 'none' }],
  ...makeGlobalStaticRules('case', 'text-transform'),
]

export const fontStyles: Rule[] = [
  ['italic', { 'font-style': 'italic' }],
  ['not-italic', { 'font-style': 'normal' }],
  ['font-italic', { 'font-style': 'italic' }],
  ['font-not-italic', { 'font-style': 'normal' }],
  ['oblique', { 'font-style': 'oblique' }],
  ['not-oblique', { 'font-style': 'normal' }],
  ['font-oblique', { 'font-style': 'oblique' }],
  ['font-not-oblique', { 'font-style': 'normal' }],
]

export const fontSmoothings: Rule[] = [
  ['antialiased', {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
    'font-smoothing': 'grayscale',
  }],
  ['subpixel-antialiased', {
    '-webkit-font-smoothing': 'auto',
    '-moz-osx-font-smoothing': 'auto',
    'font-smoothing': 'auto',
  }],
]
