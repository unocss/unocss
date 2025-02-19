import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { globalKeywords, h, makeGlobalStaticRules, positionMap } from '../utils'

const cursorValues = ['auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait', 'cell', 'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out']
const containValues = ['none', 'strict', 'content', 'size', 'inline-size', 'layout', 'style', 'paint']

export const varEmpty = ' '

// display table included on table.ts
export const displays: Rule<Theme>[] = [
  ['inline', { display: 'inline' }],
  ['block', { display: 'block' }],
  ['inline-block', { display: 'inline-block' }],
  ['contents', { display: 'contents' }],
  ['flow-root', { display: 'flow-root' }],
  ['list-item', { display: 'list-item' }],
  ['hidden', { display: 'none' }],
  [/^display-(.+)$/, ([, c]) => ({ display: h.bracket.cssvar.global(c) })],
]

export const appearances: Rule<Theme>[] = [
  ['visible', { visibility: 'visible' }],
  ['invisible', { visibility: 'hidden' }],
  ['backface-visible', { 'backface-visibility': 'visible' }],
  ['backface-hidden', { 'backface-visibility': 'hidden' }],
  ...makeGlobalStaticRules('backface', 'backface-visibility'),
]

export const cursors: Rule<Theme>[] = [
  [/^cursor-(.+)$/, ([, c]) => ({ cursor: h.bracket.cssvar.global(c) })],
  ...cursorValues.map((v): Rule<Theme> => [`cursor-${v}`, { cursor: v }]),
]

export const contains: Rule<Theme>[] = [
  [/^contain-(.*)$/, ([, d]) => {
    if (h.bracket(d) != null) {
      return {
        contain: h.bracket(d)!.split(' ').map(e => h.cssvar.fraction(e) ?? e).join(' '),
      }
    }

    return containValues.includes(d) ? { contain: d } : undefined
  }],
]

export const pointerEvents: Rule<Theme>[] = [
  ['pointer-events-auto', { 'pointer-events': 'auto' }],
  ['pointer-events-none', { 'pointer-events': 'none' }],
  ...makeGlobalStaticRules('pointer-events'),
]

export const resizes: Rule<Theme>[] = [
  ['resize-x', { resize: 'horizontal' }],
  ['resize-y', { resize: 'vertical' }],
  ['resize', { resize: 'both' }],
  ['resize-none', { resize: 'none' }],
  ...makeGlobalStaticRules('resize'),
]

export const userSelects: Rule<Theme>[] = [
  ['select-auto', { '-webkit-user-select': 'auto', 'user-select': 'auto' }],
  ['select-all', { '-webkit-user-select': 'all', 'user-select': 'all' }],
  ['select-text', { '-webkit-user-select': 'text', 'user-select': 'text' }],
  ['select-none', { '-webkit-user-select': 'none', 'user-select': 'none' }],
  ...makeGlobalStaticRules('select', 'user-select'),
]

export const whitespaces: Rule<Theme>[] = [
  [
    /^(?:whitespace-|ws-)([-\w]+)$/,
    ([, v]) => ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces', ...globalKeywords].includes(v) ? { 'white-space': v } : undefined,
    { autocomplete: '(whitespace|ws)-(normal|nowrap|pre|pre-line|pre-wrap|break-spaces)' },
  ],
]

export const contentVisibility: Rule<Theme>[] = [
  [/^intrinsic-size-(.+)$/, ([, d]) => ({ 'contain-intrinsic-size': h.bracket.cssvar.global.fraction.rem(d) }), { autocomplete: 'intrinsic-size-<num>' }],
  ['content-visibility-visible', { 'content-visibility': 'visible' }],
  ['content-visibility-hidden', { 'content-visibility': 'hidden' }],
  ['content-visibility-auto', { 'content-visibility': 'auto' }],
  ...makeGlobalStaticRules('content-visibility'),
]

export const contents: Rule<Theme>[] = [
  [/^content-(.+)$/, ([, v]) => ({ content: h.bracket.cssvar(v) })],
  ['content-empty', { content: '""' }],
  ['content-none', { content: 'none' }],
]

export const breaks: Rule<Theme>[] = [
  ['break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' }],
  ['break-words', { 'overflow-wrap': 'break-word' }],
  ['break-all', { 'word-break': 'break-all' }],
  ['break-keep', { 'word-break': 'keep-all' }],
  ['break-anywhere', { 'overflow-wrap': 'anywhere' }],
]

export const textWraps: Rule<Theme>[] = [
  ['text-wrap', { 'text-wrap': 'wrap' }],
  ['text-nowrap', { 'text-wrap': 'nowrap' }],
  ['text-balance', { 'text-wrap': 'balance' }],
  ['text-pretty', { 'text-wrap': 'pretty' }],
]

export const textOverflows: Rule<Theme>[] = [
  ['truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
  ['text-truncate', { 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }],
  ['text-ellipsis', { 'text-overflow': 'ellipsis' }],
  ['text-clip', { 'text-overflow': 'clip' }],
]

export const textTransforms: Rule<Theme>[] = [
  ['case-upper', { 'text-transform': 'uppercase' }],
  ['case-lower', { 'text-transform': 'lowercase' }],
  ['case-capital', { 'text-transform': 'capitalize' }],
  ['case-normal', { 'text-transform': 'none' }],
  ['uppercase', { 'text-transform': 'uppercase' }],
  ['lowercase', { 'text-transform': 'lowercase' }],
  ['capitalize', { 'text-transform': 'capitalize' }],
  ['normal-case', { 'text-transform': 'none' }],
  ...makeGlobalStaticRules('case', 'text-transform'),
]

export const fontStyles: Rule<Theme>[] = [
  ['italic', { 'font-style': 'italic' }],
  ['not-italic', { 'font-style': 'normal' }],
  ['font-italic', { 'font-style': 'italic' }],
  ['font-not-italic', { 'font-style': 'normal' }],
  ['oblique', { 'font-style': 'oblique' }],
  ['not-oblique', { 'font-style': 'normal' }],
  ['font-oblique', { 'font-style': 'oblique' }],
  ['font-not-oblique', { 'font-style': 'normal' }],
]

export const fontSmoothings: Rule<Theme>[] = [
  ['antialiased', {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  }],
  ['subpixel-antialiased', {
    '-webkit-font-smoothing': 'auto',
    '-moz-osx-font-smoothing': 'auto',
  }],
]

export const hyphens: Rule<Theme>[] = [
  ...['manual', 'auto', 'none', ...globalKeywords].map(keyword => [`hyphens-${keyword}`, {
    '-webkit-hyphens': keyword,
    '-ms-hyphens': keyword,
    'hyphens': keyword,
  }] as Rule<Theme>),
]

export const writingModes: Rule<Theme>[] = [
  ['write-vertical-right', { 'writing-mode': 'vertical-rl' }],
  ['write-vertical-left', { 'writing-mode': 'vertical-lr' }],
  ['write-normal', { 'writing-mode': 'horizontal-tb' }],
  ...makeGlobalStaticRules('write', 'writing-mode'),
]

export const writingOrientations: Rule<Theme>[] = [
  ['write-orient-mixed', { 'text-orientation': 'mixed' }],
  ['write-orient-sideways', { 'text-orientation': 'sideways' }],
  ['write-orient-upright', { 'text-orientation': 'upright' }],
  ...makeGlobalStaticRules('write-orient', 'text-orientation'),
]

export const screenReadersAccess: Rule<Theme>[] = [
  [
    'sr-only',
    {
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

export const isolations: Rule<Theme>[] = [
  ['isolate', { isolation: 'isolate' }],
  ['isolate-auto', { isolation: 'auto' }],
  ['isolation-auto', { isolation: 'auto' }],
]

export const objectPositions: Rule<Theme>[] = [
  // object fit
  ['object-cover', { 'object-fit': 'cover' }],
  ['object-contain', { 'object-fit': 'contain' }],
  ['object-fill', { 'object-fit': 'fill' }],
  ['object-scale-down', { 'object-fit': 'scale-down' }],
  ['object-none', { 'object-fit': 'none' }],

  // object position
  [/^object-(.+)$/, ([, d]) => {
    if (positionMap[d])
      return { 'object-position': positionMap[d] }
    if (h.bracketOfPosition(d) != null)
      return { 'object-position': h.bracketOfPosition(d)!.split(' ').map(e => h.position.fraction.auto.px.cssvar(e) ?? e).join(' ') }
  }, { autocomplete: `object-(${Object.keys(positionMap).join('|')})` }],

]

export const backgroundBlendModes: Rule<Theme>[] = [
  ['bg-blend-multiply', { 'background-blend-mode': 'multiply' }],
  ['bg-blend-screen', { 'background-blend-mode': 'screen' }],
  ['bg-blend-overlay', { 'background-blend-mode': 'overlay' }],
  ['bg-blend-darken', { 'background-blend-mode': 'darken' }],
  ['bg-blend-lighten', { 'background-blend-mode': 'lighten' }],
  ['bg-blend-color-dodge', { 'background-blend-mode': 'color-dodge' }],
  ['bg-blend-color-burn', { 'background-blend-mode': 'color-burn' }],
  ['bg-blend-hard-light', { 'background-blend-mode': 'hard-light' }],
  ['bg-blend-soft-light', { 'background-blend-mode': 'soft-light' }],
  ['bg-blend-difference', { 'background-blend-mode': 'difference' }],
  ['bg-blend-exclusion', { 'background-blend-mode': 'exclusion' }],
  ['bg-blend-hue', { 'background-blend-mode': 'hue' }],
  ['bg-blend-saturation', { 'background-blend-mode': 'saturation' }],
  ['bg-blend-color', { 'background-blend-mode': 'color' }],
  ['bg-blend-luminosity', { 'background-blend-mode': 'luminosity' }],
  ['bg-blend-normal', { 'background-blend-mode': 'normal' }],
  ...makeGlobalStaticRules('bg-blend', 'background-blend'),
]

export const mixBlendModes: Rule<Theme>[] = [
  ['mix-blend-multiply', { 'mix-blend-mode': 'multiply' }],
  ['mix-blend-screen', { 'mix-blend-mode': 'screen' }],
  ['mix-blend-overlay', { 'mix-blend-mode': 'overlay' }],
  ['mix-blend-darken', { 'mix-blend-mode': 'darken' }],
  ['mix-blend-lighten', { 'mix-blend-mode': 'lighten' }],
  ['mix-blend-color-dodge', { 'mix-blend-mode': 'color-dodge' }],
  ['mix-blend-color-burn', { 'mix-blend-mode': 'color-burn' }],
  ['mix-blend-hard-light', { 'mix-blend-mode': 'hard-light' }],
  ['mix-blend-soft-light', { 'mix-blend-mode': 'soft-light' }],
  ['mix-blend-difference', { 'mix-blend-mode': 'difference' }],
  ['mix-blend-exclusion', { 'mix-blend-mode': 'exclusion' }],
  ['mix-blend-hue', { 'mix-blend-mode': 'hue' }],
  ['mix-blend-saturation', { 'mix-blend-mode': 'saturation' }],
  ['mix-blend-color', { 'mix-blend-mode': 'color' }],
  ['mix-blend-luminosity', { 'mix-blend-mode': 'luminosity' }],
  ['mix-blend-plus-lighter', { 'mix-blend-mode': 'plus-lighter' }],
  ['mix-blend-normal', { 'mix-blend-mode': 'normal' }],
  ...makeGlobalStaticRules('mix-blend'),
]

export const dynamicViewportHeight: Rule<Theme>[] = [
  ['min-h-dvh', { 'min-height': '100dvh' }],
  ['min-h-svh', { 'min-height': '100svh' }],
  ['min-h-lvh', { 'min-height': '100lvh' }],
  ['h-dvh', { height: '100dvh' }],
  ['h-svh', { height: '100svh' }],
  ['h-lvh', { height: '100lvh' }],
  ['max-h-dvh', { 'max-height': '100dvh' }],
  ['max-h-svh', { 'max-height': '100svh' }],
  ['max-h-lvh', { 'max-height': '100lvh' }],
]
