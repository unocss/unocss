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
  [/^select-(none|text|all|auto)$/, ([, v]) => ({ 'user-select': v })],
]

export const whitespaces: Rule[] = [
  [/^(?:whitespace|ws)-(normal|nowrap|pre|pre-line|pre-wrap)$/, ([, v]) => ({ 'white-space': v })],
]

export const breaks: Rule[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-word', { 'overflow-wrap': 'break-word' }],
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
  // tailwind compact
  ['uppercase', { 'text-transform': 'uppercase' }],
  ['lowercase', { 'text-transform': 'lowercase' }],
  ['capitalize', { 'text-transform': 'capitalize' }],
  ['normal-case', { 'text-transform': 'none' }],
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
