import type { Rule } from '@unocss/core'
import { globalKeywords, h, makeGlobalStaticRules } from '../utils'

const cursorValues = ['auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait', 'cell', 'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out']
const containValues = ['none', 'strict', 'content', 'size', 'inline-size', 'layout', 'style', 'paint']

export const varEmpty = ' '

// display table included on table.ts
export const displays: Rule[] = [
  ['inline', { display: 'inline' }],
  ['block', { display: 'block' }],
  ['inline-block', { display: 'inline-block' }],
  ['contents', { display: 'contents' }],
  ['flow-root', { display: 'flow-root' }],
  ['list-item', { display: 'list-item' }],
  ['hidden', { display: 'none' }],
  [/^display-(.+)$/, ([, c]) => ({ display: h.bracket.cssvar.global(c) })],
]

export const appearances: Rule[] = [
  ['visible', { visibility: 'visible' }],
  ['invisible', { visibility: 'hidden' }],
  ['backface-visible', { 'backface-visibility': 'visible' }],
  ['backface-hidden', { 'backface-visibility': 'hidden' }],
  ...makeGlobalStaticRules('backface', 'backface-visibility'),
]

export const cursors: Rule[] = [
  [/^cursor-(.+)$/, ([, c]) => ({ cursor: h.bracket.cssvar.global(c) })],
  ...cursorValues.map((v): Rule => [`cursor-${v}`, { cursor: v }]),
]

export const contains: Rule[] = [
  [/^contain-(.*)$/, ([, d]) => {
    if (h.bracket(d) != null) {
      return {
        contain: h.bracket(d)!.split(' ').map(e => h.cssvar.fraction(e) ?? e).join(' '),
      }
    }

    return containValues.includes(d) ? { contain: d } : undefined
  }],
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
  ['select-auto', { '-webkit-user-select': 'auto', 'user-select': 'auto' }],
  ['select-all', { '-webkit-user-select': 'all', 'user-select': 'all' }],
  ['select-text', { '-webkit-user-select': 'text', 'user-select': 'text' }],
  ['select-none', { '-webkit-user-select': 'none', 'user-select': 'none' }],
  ...makeGlobalStaticRules('select', 'user-select'),
]

export const whitespaces: Rule[] = [
  [
    /^(?:whitespace-|ws-)([-\w]+)$/,
    ([, v]) => ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces', ...globalKeywords].includes(v) ? { 'white-space': v } : undefined,
    { autocomplete: '(whitespace|ws)-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces)' },
  ],
]

export const contentVisibility: Rule[] = [
  [/^intrinsic-size-(.+)$/, ([, d]) => ({ 'contain-intrinsic-size': h.bracket.cssvar.global.fraction.rem(d) }), { autocomplete: 'intrinsic-size-<num>' }],
  ['content-visibility-visible', { 'content-visibility': 'visible' }],
  ['content-visibility-hidden', { 'content-visibility': 'hidden' }],
  ['content-visibility-auto', { 'content-visibility': 'auto' }],
  ...makeGlobalStaticRules('content-visibility'),
]

export const contents: Rule[] = [
  [/^content-(.+)$/, ([, v]) => ({ content: h.bracket.cssvar(v) })],
  ['content-empty', { content: '""' }],
  ['content-none', { content: 'none' }],
]

export const breaks: Rule[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-words', { 'overflow-wrap': 'break-word' }],
  ['break-all', { 'word-break': 'break-all' }],
  ['break-keep', { 'word-break': 'keep-all' }],
  ['break-anywhere', { 'overflow-wrap': 'anywhere' }],
]

export const textWraps: Rule[] = [
  ['text-wrap', { 'text-wrap': 'wrap' }],
  ['text-nowrap', { 'text-wrap': 'nowrap' }],
  ['text-balance', { 'text-wrap': 'balance' }],
]

export const textOverflows: Rule[] = [
  ['truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
  ['text-truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
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
  }],
  ['subpixel-antialiased', {
    '-webkit-font-smoothing': 'auto',
    '-moz-osx-font-smoothing': 'auto',
  }],
]
