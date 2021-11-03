import { Rule } from '@unocss/core'

// display table included on table.ts
export const displays: Rule[] = [
  ['inline', { display: 'inline' }],
  ['block', { display: 'block' }],
  ['inline-block', { display: 'inline-block' }],
  ['contents', { display: 'contents' }],
  ['flow-root', { display: 'flow-root' }],
  ['list-item', { display: 'list-item' }],
  ['hidden', { display: 'none' }],
]

export const appearances: Rule[] = [
  ['outline-none', { 'outline': '2px solid transparent', 'outline-offset': '2px' }],
  ['visible', { visibility: 'visible' }],
  ['invisible', { visibility: 'hidden' }],
  ['backface-visible', { 'backface-visibility': 'visible' }],
  ['backface-hidden', { 'backface-visibility': 'hidden' }],
]

export const cursors: Rule[] = [
  [/^cursor-(.+)$/, ([, c]) => ({ cursor: c })],
]

export const pointerEvents: Rule[] = [
  ['pointer-events-none', { 'pointer-events': 'none' }],
  ['pointer-events-auto', { 'pointer-events': 'auto' }],
]

export const resizes: Rule[] = [
  ['resize-none', { resize: 'none' }],
  ['resize-x', { resize: 'horizontal' }],
  ['resize-y', { resize: 'vertical' }],
  ['resize', { resize: 'both' }],
]

export const userSelects: Rule[] = [
  ['select-none', { 'user-select': 'none' }],
  ['select-text', { 'user-select': 'text' }],
  ['select-all', { 'user-select': 'all' }],
  ['select-auto', { 'user-select': 'auto' }],
]

export const verticalAligns: Rule[] = [
  ['vertical-baseline', { 'vertical-align': 'baseline' }],
  ['vertical-top', { 'vertical-align': 'top' }],
  ['vertical-middle', { 'vertical-align': 'middle' }],
  ['vertical-text-top', { 'vertical-align': 'text-top' }],
  ['vertical-text-bottom', { 'vertical-align': 'text-bottom' }],
]

export const whitespaces: Rule[] = [
  ['whitespace-normal', { 'white-space': 'normal' }],
  ['whitespace-nowrap', { 'white-space': 'nowrap' }],
  ['whitespace-pre', { 'white-space': 'pre' }],
  ['whitespace-pre-line', { 'white-space': 'pre-line' }],
  ['whitespace-pre-wrap', { 'white-space': 'pre-wrap' }],
]

export const breaks: Rule[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-works', { 'overflow-wrap': 'break-word' }],
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
]

export const textDecorations: Rule[] = [
  ['underline', { 'text-decoration': 'underline' }],
  ['line-through', { 'text-decoration': 'line-through' }],
  ['no-underline', { 'text-decoration': 'none' }],
]

export const textDecorationStyles: Rule[] = [
  ['underline-solid', { 'text-decoration-style': 'solid' }],
  ['underline-double', { 'text-decoration-style': 'double' }],
  ['underline-dotted', { 'text-decoration-style': 'dotted' }],
  ['underline-dashed', { 'text-decoration-style': 'dashed' }],
]

export const textAligns: Rule[] = [
  ['text-center', { 'text-align': 'center' }],
  ['text-left', { 'text-align': 'left' }],
  ['text-right', { 'text-align': 'right' }],
  ['text-justify', { 'text-align': 'justify' }],
]

export const fontStyles: Rule[] = [
  ['italic', { 'font-style': 'italic' }],
  ['not-italic', { 'font-style': 'normal' }],
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

export const hyphens: Rule[] = [
  ['hyphens-none', {
    '-webkit-hyphens': 'none',
    '-ms-hyphens': 'none',
    'hyphens': 'none',
  }],
  ['hyphens-manual', {
    '-webkit-hyphens': 'manual',
    '-ms-hyphens': 'manual',
    'hyphens': 'manual',
  }],
  ['hyphens-auto', {
    '-webkit-hyphens': 'auto',
    '-ms-hyphens': 'auto',
    'hyphens': 'auto',
  }],
]

export const writingModes: Rule[] = [
  ['write-normal', { 'writing-mode': 'horizontal-tb' }],
  ['write-vertical-right', { 'writing-mode': 'vertical-rl' }],
  ['write-vertical-left', { 'writing-mode': 'vertical-lr' }],
]

export const writingOrientations: Rule[] = [
  ['write-orient-mixed', { 'text-orientation': 'mixed' }],
  ['write-orient-upright', { 'text-orientation': 'upright' }],
  ['write-orient-sideways', { 'text-orientation': 'sideways' }],
]

export const screenReadersAccess: Rule[] = [
  [
    'sr-only', {
      'position': 'absolute',
      'width': '1px',
      'height': '1px',
      'padding': '0',
      'margin': '-1px',
      'overflow': 'hidden',
      'clip': 'rect(0,0,0,0)',
      'white-space': 'nowrap',
      'border-width': 0,
    },
  ],
  [
    'not-sr-only',
    {
      'position': 'static',
      'width': 'auto',
      'height': 'auto',
      'padding': '0',
      'margin': '0',
      'overflow': 'visible',
      'clip': 'auto',
      'white-space': 'normal',
    },
  ],
]
