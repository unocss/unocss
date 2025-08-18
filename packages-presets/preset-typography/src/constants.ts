import type { TypographyColorScheme, TypographyCSSObject, TypographySizeScheme } from './types'

export const modifiers = [
  ['headings', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th'],
  ['h1'],
  ['h2'],
  ['h3'],
  ['h4'],
  ['h5'],
  ['h6'],
  ['p'],
  ['a'],
  ['blockquote'],
  ['figure'],
  ['figcaption'],
  ['strong'],
  ['em'],
  ['kbd'],
  ['code'],
  ['pre'],
  ['ol'],
  ['ul'],
  ['li'],
  ['table'],
  ['thead'],
  ['tr'],
  ['th'],
  ['td'],
  ['img'],
  ['video'],
  ['hr'],
]

export const defaultColorScheme: TypographyColorScheme = {
  'body': [700, 300],
  'headings': [900, 'white'],
  'lead': [600, 400],
  'links': [900, 'white'],
  'bold': [900, 'white'],
  'counters': [500, 400],
  'bullets': [300, 600],
  'hr': [200, 700],
  'quotes': [900, 100],
  'quote-borders': [200, 700],
  'captions': [500, 400],
  'kbd': [900, 'white'],
  'kbd-shadows': [900, 'white'],
  'code': [900, 'white'],
  'pre-code': [200, 300],
  'pre-bg': [800, 'rgb(0 0 0 / 50%)'],
  'th-borders': [300, 600],
  'td-borders': [200, 700],
}

/*
 * Credits to Tailwind Labs for the original implementation:
 * https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js
 * License: MIT
 */

const round = (num: number) => num.toFixed(7).replace(/0+$/, '').replace(/\.$/, '')
const rem = (px: number) => `${round(px / 16)}rem`
const em = (px: number, base: number) => `${round(px / base)}em`

export const ProseDefaultCSSObject: TypographyCSSObject = {
  'color': 'var(--un-prose-body)',
  'max-width': '65ch',
  'p': {}, // Required to maintain correct order when merging
  '[class~="lead"]': {
    color: 'var(--un-prose-lead)',
  },
  'a': {
    'color': 'var(--un-prose-links)',
    'text-decoration': 'underline',
    'font-weight': '500',
  },
  'strong': {
    'color': 'var(--un-prose-bold)',
    'font-weight': '600',
  },
  'a strong': {
    color: 'inherit',
  },
  'blockquote strong': {
    color: 'inherit',
  },
  'thead th strong': {
    color: 'inherit',
  },
  'ol': {
    'list-style-type': 'decimal',
  },
  'ol[type="A"]': {
    'list-style-type': 'upper-alpha',
  },
  'ol[type="a"]': {
    'list-style-type': 'lower-alpha',
  },
  'ol[type="A" s]': {
    'list-style-type': 'upper-alpha',
  },
  'ol[type="a" s]': {
    'list-style-type': 'lower-alpha',
  },
  'ol[type="I"]': {
    'list-style-type': 'upper-roman',
  },
  'ol[type="i"]': {
    'list-style-type': 'lower-roman',
  },
  'ol[type="I" s]': {
    'list-style-type': 'upper-roman',
  },
  'ol[type="i" s]': {
    'list-style-type': 'lower-roman',
  },
  'ol[type="1"]': {
    'list-style-type': 'decimal',
  },
  'ul': {
    'list-style-type': 'disc',
  },
  'ol > li::marker': {
    'font-weight': '400',
    'color': 'var(--un-prose-counters)',
  },
  'ul > li::marker': {
    color: 'var(--un-prose-bullets)',
  },
  'dt': {
    'color': 'var(--un-prose-headings)',
    'font-weight': '600',
  },
  'hr': {
    'border-color': 'var(--un-prose-hr)',
    'border-top-width': '1px',
  },
  'blockquote': {
    'font-weight': '500',
    'font-style': 'italic',
    'color': 'var(--un-prose-quotes)',
    'border-inline-start-width': '0.25rem',
    'border-inline-start-color': 'var(--un-prose-quote-borders)',
    'quotes': '"\\201C""\\201D""\\2018""\\2019"',
  },
  'blockquote p:first-of-type::before': {
    content: 'open-quote',
  },
  'blockquote p:last-of-type::after': {
    content: 'close-quote',
  },
  'h1': {
    'color': 'var(--un-prose-headings)',
    'font-weight': '800',
  },
  'h1 strong': {
    'font-weight': '900',
    'color': 'inherit',
  },
  'h2': {
    'color': 'var(--un-prose-headings)',
    'font-weight': '700',
  },
  'h2 strong': {
    'font-weight': '800',
    'color': 'inherit',
  },
  'h3': {
    'color': 'var(--un-prose-headings)',
    'font-weight': '600',
  },
  'h3 strong': {
    'font-weight': '700',
    'color': 'inherit',
  },
  'h4': {
    'color': 'var(--un-prose-headings)',
    'font-weight': '600',
  },
  'h4 strong': {
    'font-weight': '700',
    'color': 'inherit',
  },
  'img': {}, // Required to maintain correct order when merging
  'picture': {
    display: 'block',
  },
  'video': {}, // Required to maintain correct order when merging
  'kbd': {
    'font-weight': '500',
    'font-family': 'inherit',
    'color': 'var(--un-prose-kbd)',
    'box-shadow': '0 0 0 1px rgb(var(--un-prose-kbd-shadows) / 10%), 0 3px 0 rgb(var(--un-prose-kbd-shadows) / 10%)',
  },
  'code': {
    'color': 'var(--un-prose-code)',
    'font-weight': '600',
  },
  'code::before': {
    content: '"`"',
  },
  'code::after': {
    content: '"`"',
  },
  'a code': {
    color: 'inherit',
  },
  'h1 code': {
    color: 'inherit',
  },
  'h2 code': {
    color: 'inherit',
  },
  'h3 code': {
    color: 'inherit',
  },
  'h4 code': {
    color: 'inherit',
  },
  'blockquote code': {
    color: 'inherit',
  },
  'thead th code': {
    color: 'inherit',
  },
  'pre': {
    'color': 'var(--un-prose-pre-code)',
    'background-color': 'var(--un-prose-pre-bg)',
    'overflow-x': 'auto',
    'font-weight': '400',
  },
  'pre code': {
    'background-color': 'transparent',
    'border-width': '0',
    'border-radius': '0',
    'padding': '0',
    'font-weight': 'inherit',
    'color': 'inherit',
    'font-size': 'inherit',
    'font-family': 'inherit',
    'line-height': 'inherit',
  },
  'pre code::before': {
    content: 'none',
  },
  'pre code::after': {
    content: 'none',
  },
  'table': {
    'width': '100%',
    'table-layout': 'auto',
    'margin-top': em(32, 16),
    'margin-bottom': em(32, 16),
  },
  'thead': {
    'border-bottom-width': '1px',
    'border-bottom-color': 'var(--un-prose-th-borders)',
  },
  'thead th': {
    'color': 'var(--un-prose-headings)',
    'font-weight': '600',
    'vertical-align': 'bottom',
  },
  'tbody tr': {
    'border-bottom-width': '1px',
    'border-bottom-color': 'var(--un-prose-td-borders)',
  },
  'tbody tr:last-child': {
    'border-bottom-width': '0',
  },
  'tbody td': {
    'vertical-align': 'baseline',
  },
  'tfoot': {
    'border-top-width': '1px',
    'border-top-color': 'var(--un-prose-th-borders)',
  },
  'tfoot td': {
    'vertical-align': 'top',
  },
  'th, td': {
    'text-align': 'start',
  },
  'figure > *': {}, // Required to maintain correct order when merging
  'figcaption': {
    color: 'var(--un-prose-captions)',
  },
}

export const ProseDefaultSize: TypographySizeScheme = {
  'sm': {
    'font-size': rem(14),
    'line-height': round(24 / 14),
    'p': {
      'margin-top': em(16, 14),
      'margin-bottom': em(16, 14),
    },
    '[class~="lead"]': {
      'font-size': em(18, 14),
      'line-height': round(28 / 18),
      'margin-top': em(16, 18),
      'margin-bottom': em(16, 18),
    },
    'blockquote': {
      'margin-top': em(24, 18),
      'margin-bottom': em(24, 18),
      'padding-inline-start': em(20, 18),
    },
    'h1': {
      'font-size': em(30, 14),
      'margin-top': '0',
      'margin-bottom': em(24, 30),
      'line-height': round(36 / 30),
    },
    'h2': {
      'font-size': em(20, 14),
      'margin-top': em(32, 20),
      'margin-bottom': em(16, 20),
      'line-height': round(28 / 20),
    },
    'h3': {
      'font-size': em(18, 14),
      'margin-top': em(28, 18),
      'margin-bottom': em(8, 18),
      'line-height': round(28 / 18),
    },
    'h4': {
      'margin-top': em(20, 14),
      'margin-bottom': em(8, 14),
      'line-height': round(20 / 14),
    },
    'img': {
      'margin-top': em(24, 14),
      'margin-bottom': em(24, 14),
    },
    'picture': {
      'margin-top': em(24, 14),
      'margin-bottom': em(24, 14),
    },
    'picture > img': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'video': {
      'margin-top': em(24, 14),
      'margin-bottom': em(24, 14),
    },
    'kbd': {
      'font-size': em(12, 14),
      'border-radius': rem(5),
      'padding-top': em(2, 14),
      'padding-inline-end': em(5, 14),
      'padding-bottom': em(2, 14),
      'padding-inline-start': em(5, 14),
    },
    'code': {
      'font-size': em(12, 14),
    },
    'h2 code': {
      'font-size': em(18, 20),
    },
    'h3 code': {
      'font-size': em(16, 18),
    },
    'pre': {
      'font-size': em(12, 14),
      'line-height': round(20 / 12),
      'margin-top': em(20, 12),
      'margin-bottom': em(20, 12),
      'border-radius': rem(4),
      'padding-top': em(8, 12),
      'padding-inline-end': em(12, 12),
      'padding-bottom': em(8, 12),
      'padding-inline-start': em(12, 12),
    },
    'ol': {
      'margin-top': em(16, 14),
      'margin-bottom': em(16, 14),
      'padding-inline-start': em(22, 14),
    },
    'ul': {
      'margin-top': em(16, 14),
      'margin-bottom': em(16, 14),
      'padding-inline-start': em(22, 14),
    },
    'li': {
      'margin-top': em(4, 14),
      'margin-bottom': em(4, 14),
    },
    'ol > li': {
      'padding-inline-start': em(6, 14),
    },
    'ul > li': {
      'padding-inline-start': em(6, 14),
    },
    '> ul > li p': {
      'margin-top': em(8, 14),
      'margin-bottom': em(8, 14),
    },
    '> ul > li > p:first-child': {
      'margin-top': em(16, 14),
    },
    '> ul > li > p:last-child': {
      'margin-bottom': em(16, 14),
    },
    '> ol > li > p:first-child': {
      'margin-top': em(16, 14),
    },
    '> ol > li > p:last-child': {
      'margin-bottom': em(16, 14),
    },
    'ul ul, ul ol, ol ul, ol ol': {
      'margin-top': em(8, 14),
      'margin-bottom': em(8, 14),
    },
    'dl': {
      'margin-top': em(16, 14),
      'margin-bottom': em(16, 14),
    },
    'dt': {
      'margin-top': em(16, 14),
    },
    'dd': {
      'margin-top': em(4, 14),
      'padding-inline-start': em(22, 14),
    },
    'hr': {
      'margin-top': em(40, 14),
      'margin-bottom': em(40, 14),
    },
    'hr + *': {
      'margin-top': '0',
    },
    'h2 + *': {
      'margin-top': '0',
    },
    'h3 + *': {
      'margin-top': '0',
    },
    'h4 + *': {
      'margin-top': '0',
    },
    'table': {
      'font-size': em(12, 14),
      'line-height': round(18 / 12),
    },
    'thead th': {
      'padding-inline-end': em(12, 12),
      'padding-bottom': em(8, 12),
      'padding-inline-start': em(12, 12),
    },
    'thead th:first-child': {
      'padding-inline-start': '0',
    },
    'thead th:last-child': {
      'padding-inline-end': '0',
    },
    'tbody td, tfoot td': {
      'padding-top': em(8, 12),
      'padding-inline-end': em(12, 12),
      'padding-bottom': em(8, 12),
      'padding-inline-start': em(12, 12),
    },
    'tbody td:first-child, tfoot td:first-child': {
      'padding-inline-start': '0',
    },
    'tbody td:last-child, tfoot td:last-child': {
      'padding-inline-end': '0',
    },
    'figure': {
      'margin-top': em(24, 14),
      'margin-bottom': em(24, 14),
    },
    'figure > *': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'figcaption': {
      'font-size': em(12, 14),
      'line-height': round(16 / 12),
      'margin-top': em(8, 12),
    },
    '> :first-child': {
      'margin-top': '0',
    },
    '> :last-child': {
      'margin-bottom': '0',
    },
  },
  'base': {
    'font-size': rem(16),
    'line-height': round(28 / 16),
    'p': {
      'margin-top': em(20, 16),
      'margin-bottom': em(20, 16),
    },
    '[class~="lead"]': {
      'font-size': em(20, 16),
      'line-height': round(32 / 20),
      'margin-top': em(24, 20),
      'margin-bottom': em(24, 20),
    },
    'blockquote': {
      'margin-top': em(32, 20),
      'margin-bottom': em(32, 20),
      'padding-inline-start': em(20, 20),
    },
    'h1': {
      'font-size': em(36, 16),
      'margin-top': '0',
      'margin-bottom': em(32, 36),
      'line-height': round(40 / 36),
    },
    'h2': {
      'font-size': em(24, 16),
      'margin-top': em(48, 24),
      'margin-bottom': em(24, 24),
      'line-height': round(32 / 24),
    },
    'h3': {
      'font-size': em(20, 16),
      'margin-top': em(32, 20),
      'margin-bottom': em(12, 20),
      'line-height': round(32 / 20),
    },
    'h4': {
      'margin-top': em(24, 16),
      'margin-bottom': em(8, 16),
      'line-height': round(24 / 16),
    },
    'img': {
      'margin-top': em(32, 16),
      'margin-bottom': em(32, 16),
    },
    'picture': {
      'margin-top': em(32, 16),
      'margin-bottom': em(32, 16),
    },
    'picture > img': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'video': {
      'margin-top': em(32, 16),
      'margin-bottom': em(32, 16),
    },
    'kbd': {
      'font-size': em(14, 16),
      'border-radius': rem(5),
      'padding-top': em(3, 16),
      'padding-inline-end': em(6, 16),
      'padding-bottom': em(3, 16),
      'padding-inline-start': em(6, 16),
    },
    'code': {
      'font-size': em(14, 16),
    },
    'h2 code': {
      'font-size': em(21, 24),
    },
    'h3 code': {
      'font-size': em(18, 20),
    },
    'pre': {
      'font-size': em(14, 16),
      'line-height': round(24 / 14),
      'margin-top': em(24, 14),
      'margin-bottom': em(24, 14),
      'border-radius': rem(6),
      'padding-top': em(12, 14),
      'padding-inline-end': em(16, 14),
      'padding-bottom': em(12, 14),
      'padding-inline-start': em(16, 14),
    },
    'ol': {
      'margin-top': em(20, 16),
      'margin-bottom': em(20, 16),
      'padding-inline-start': em(26, 16),
    },
    'ul': {
      'margin-top': em(20, 16),
      'margin-bottom': em(20, 16),
      'padding-inline-start': em(26, 16),
    },
    'li': {
      'margin-top': em(8, 16),
      'margin-bottom': em(8, 16),
    },
    'ol > li': {
      'padding-inline-start': em(6, 16),
    },
    'ul > li': {
      'padding-inline-start': em(6, 16),
    },
    '> ul > li p': {
      'margin-top': em(12, 16),
      'margin-bottom': em(12, 16),
    },
    '> ul > li > p:first-child': {
      'margin-top': em(20, 16),
    },
    '> ul > li > p:last-child': {
      'margin-bottom': em(20, 16),
    },
    '> ol > li > p:first-child': {
      'margin-top': em(20, 16),
    },
    '> ol > li > p:last-child': {
      'margin-bottom': em(20, 16),
    },
    'ul ul, ul ol, ol ul, ol ol': {
      'margin-top': em(12, 16),
      'margin-bottom': em(12, 16),
    },
    'dl': {
      'margin-top': em(20, 16),
      'margin-bottom': em(20, 16),
    },
    'dt': {
      'margin-top': em(20, 16),
    },
    'dd': {
      'margin-top': em(8, 16),
      'padding-inline-start': em(26, 16),
    },
    'hr': {
      'margin-top': em(48, 16),
      'margin-bottom': em(48, 16),
    },
    'hr + *': {
      'margin-top': '0',
    },
    'h2 + *': {
      'margin-top': '0',
    },
    'h3 + *': {
      'margin-top': '0',
    },
    'h4 + *': {
      'margin-top': '0',
    },
    'table': {
      'font-size': em(14, 16),
      'line-height': round(24 / 14),
    },
    'thead th': {
      'padding-inline-end': em(8, 14),
      'padding-bottom': em(8, 14),
      'padding-inline-start': em(8, 14),
    },
    'thead th:first-child': {
      'padding-inline-start': '0',
    },
    'thead th:last-child': {
      'padding-inline-end': '0',
    },
    'tbody td, tfoot td': {
      'padding-top': em(8, 14),
      'padding-inline-end': em(8, 14),
      'padding-bottom': em(8, 14),
      'padding-inline-start': em(8, 14),
    },
    'tbody td:first-child, tfoot td:first-child': {
      'padding-inline-start': '0',
    },
    'tbody td:last-child, tfoot td:last-child': {
      'padding-inline-end': '0',
    },
    'figure': {
      'margin-top': em(32, 16),
      'margin-bottom': em(32, 16),
    },
    'figure > *': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'figcaption': {
      'font-size': em(14, 16),
      'line-height': round(20 / 14),
      'margin-top': em(12, 14),
    },
    '> :first-child': {
      'margin-top': '0',
    },
    '> :last-child': {
      'margin-bottom': '0',
    },
  },
  'lg': {
    'font-size': rem(18),
    'line-height': round(32 / 18),
    'p': {
      'margin-top': em(24, 18),
      'margin-bottom': em(24, 18),
    },
    '[class~="lead"]': {
      'font-size': em(22, 18),
      'line-height': round(32 / 22),
      'margin-top': em(24, 22),
      'margin-bottom': em(24, 22),
    },
    'blockquote': {
      'margin-top': em(40, 24),
      'margin-bottom': em(40, 24),
      'padding-inline-start': em(24, 24),
    },
    'h1': {
      'font-size': em(48, 18),
      'margin-top': '0',
      'margin-bottom': em(40, 48),
      'line-height': round(48 / 48),
    },
    'h2': {
      'font-size': em(30, 18),
      'margin-top': em(56, 30),
      'margin-bottom': em(32, 30),
      'line-height': round(40 / 30),
    },
    'h3': {
      'font-size': em(24, 18),
      'margin-top': em(40, 24),
      'margin-bottom': em(16, 24),
      'line-height': round(36 / 24),
    },
    'h4': {
      'margin-top': em(32, 18),
      'margin-bottom': em(8, 18),
      'line-height': round(28 / 18),
    },
    'img': {
      'margin-top': em(32, 18),
      'margin-bottom': em(32, 18),
    },
    'picture': {
      'margin-top': em(32, 18),
      'margin-bottom': em(32, 18),
    },
    'picture > img': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'video': {
      'margin-top': em(32, 18),
      'margin-bottom': em(32, 18),
    },
    'kbd': {
      'font-size': em(16, 18),
      'border-radius': rem(5),
      'padding-top': em(4, 18),
      'padding-inline-end': em(8, 18),
      'padding-bottom': em(4, 18),
      'padding-inline-start': em(8, 18),
    },
    'code': {
      'font-size': em(16, 18),
    },
    'h2 code': {
      'font-size': em(26, 30),
    },
    'h3 code': {
      'font-size': em(21, 24),
    },
    'pre': {
      'font-size': em(16, 18),
      'line-height': round(28 / 16),
      'margin-top': em(32, 16),
      'margin-bottom': em(32, 16),
      'border-radius': rem(6),
      'padding-top': em(16, 16),
      'padding-inline-end': em(24, 16),
      'padding-bottom': em(16, 16),
      'padding-inline-start': em(24, 16),
    },
    'ol': {
      'margin-top': em(24, 18),
      'margin-bottom': em(24, 18),
      'padding-inline-start': em(28, 18),
    },
    'ul': {
      'margin-top': em(24, 18),
      'margin-bottom': em(24, 18),
      'padding-inline-start': em(28, 18),
    },
    'li': {
      'margin-top': em(12, 18),
      'margin-bottom': em(12, 18),
    },
    'ol > li': {
      'padding-inline-start': em(8, 18),
    },
    'ul > li': {
      'padding-inline-start': em(8, 18),
    },
    '> ul > li p': {
      'margin-top': em(16, 18),
      'margin-bottom': em(16, 18),
    },
    '> ul > li > p:first-child': {
      'margin-top': em(24, 18),
    },
    '> ul > li > p:last-child': {
      'margin-bottom': em(24, 18),
    },
    '> ol > li > p:first-child': {
      'margin-top': em(24, 18),
    },
    '> ol > li > p:last-child': {
      'margin-bottom': em(24, 18),
    },
    'ul ul, ul ol, ol ul, ol ol': {
      'margin-top': em(16, 18),
      'margin-bottom': em(16, 18),
    },
    'dl': {
      'margin-top': em(24, 18),
      'margin-bottom': em(24, 18),
    },
    'dt': {
      'margin-top': em(24, 18),
    },
    'dd': {
      'margin-top': em(12, 18),
      'padding-inline-start': em(28, 18),
    },
    'hr': {
      'margin-top': em(56, 18),
      'margin-bottom': em(56, 18),
    },
    'hr + *': {
      'margin-top': '0',
    },
    'h2 + *': {
      'margin-top': '0',
    },
    'h3 + *': {
      'margin-top': '0',
    },
    'h4 + *': {
      'margin-top': '0',
    },
    'table': {
      'font-size': em(16, 18),
      'line-height': round(24 / 16),
    },
    'thead th': {
      'padding-inline-end': em(12, 16),
      'padding-bottom': em(12, 16),
      'padding-inline-start': em(12, 16),
    },
    'thead th:first-child': {
      'padding-inline-start': '0',
    },
    'thead th:last-child': {
      'padding-inline-end': '0',
    },
    'tbody td, tfoot td': {
      'padding-top': em(12, 16),
      'padding-inline-end': em(12, 16),
      'padding-bottom': em(12, 16),
      'padding-inline-start': em(12, 16),
    },
    'tbody td:first-child, tfoot td:first-child': {
      'padding-inline-start': '0',
    },
    'tbody td:last-child, tfoot td:last-child': {
      'padding-inline-end': '0',
    },
    'figure': {
      'margin-top': em(32, 18),
      'margin-bottom': em(32, 18),
    },
    'figure > *': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'figcaption': {
      'font-size': em(16, 18),
      'line-height': round(24 / 16),
      'margin-top': em(16, 16),
    },
    '> :first-child': {
      'margin-top': '0',
    },
    '> :last-child': {
      'margin-bottom': '0',
    },
  },
  'xl': {
    'font-size': rem(20),
    'line-height': round(36 / 20),
    'p': {
      'margin-top': em(24, 20),
      'margin-bottom': em(24, 20),
    },
    '[class~="lead"]': {
      'font-size': em(24, 20),
      'line-height': round(36 / 24),
      'margin-top': em(24, 24),
      'margin-bottom': em(24, 24),
    },
    'blockquote': {
      'margin-top': em(48, 30),
      'margin-bottom': em(48, 30),
      'padding-inline-start': em(32, 30),
    },
    'h1': {
      'font-size': em(56, 20),
      'margin-top': '0',
      'margin-bottom': em(48, 56),
      'line-height': round(56 / 56),
    },
    'h2': {
      'font-size': em(36, 20),
      'margin-top': em(56, 36),
      'margin-bottom': em(32, 36),
      'line-height': round(40 / 36),
    },
    'h3': {
      'font-size': em(30, 20),
      'margin-top': em(48, 30),
      'margin-bottom': em(20, 30),
      'line-height': round(40 / 30),
    },
    'h4': {
      'margin-top': em(36, 20),
      'margin-bottom': em(12, 20),
      'line-height': round(32 / 20),
    },
    'img': {
      'margin-top': em(40, 20),
      'margin-bottom': em(40, 20),
    },
    'picture': {
      'margin-top': em(40, 20),
      'margin-bottom': em(40, 20),
    },
    'picture > img': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'video': {
      'margin-top': em(40, 20),
      'margin-bottom': em(40, 20),
    },
    'kbd': {
      'font-size': em(18, 20),
      'border-radius': rem(5),
      'padding-top': em(5, 20),
      'padding-inline-end': em(8, 20),
      'padding-bottom': em(5, 20),
      'padding-inline-start': em(8, 20),
    },
    'code': {
      'font-size': em(18, 20),
    },
    'h2 code': {
      'font-size': em(31, 36),
    },
    'h3 code': {
      'font-size': em(27, 30),
    },
    'pre': {
      'font-size': em(18, 20),
      'line-height': round(32 / 18),
      'margin-top': em(36, 18),
      'margin-bottom': em(36, 18),
      'border-radius': rem(8),
      'padding-top': em(20, 18),
      'padding-inline-end': em(24, 18),
      'padding-bottom': em(20, 18),
      'padding-inline-start': em(24, 18),
    },
    'ol': {
      'margin-top': em(24, 20),
      'margin-bottom': em(24, 20),
      'padding-inline-start': em(32, 20),
    },
    'ul': {
      'margin-top': em(24, 20),
      'margin-bottom': em(24, 20),
      'padding-inline-start': em(32, 20),
    },
    'li': {
      'margin-top': em(12, 20),
      'margin-bottom': em(12, 20),
    },
    'ol > li': {
      'padding-inline-start': em(8, 20),
    },
    'ul > li': {
      'padding-inline-start': em(8, 20),
    },
    '> ul > li p': {
      'margin-top': em(16, 20),
      'margin-bottom': em(16, 20),
    },
    '> ul > li > p:first-child': {
      'margin-top': em(24, 20),
    },
    '> ul > li > p:last-child': {
      'margin-bottom': em(24, 20),
    },
    '> ol > li > p:first-child': {
      'margin-top': em(24, 20),
    },
    '> ol > li > p:last-child': {
      'margin-bottom': em(24, 20),
    },
    'ul ul, ul ol, ol ul, ol ol': {
      'margin-top': em(16, 20),
      'margin-bottom': em(16, 20),
    },
    'dl': {
      'margin-top': em(24, 20),
      'margin-bottom': em(24, 20),
    },
    'dt': {
      'margin-top': em(24, 20),
    },
    'dd': {
      'margin-top': em(12, 20),
      'padding-inline-start': em(32, 20),
    },
    'hr': {
      'margin-top': em(56, 20),
      'margin-bottom': em(56, 20),
    },
    'hr + *': {
      'margin-top': '0',
    },
    'h2 + *': {
      'margin-top': '0',
    },
    'h3 + *': {
      'margin-top': '0',
    },
    'h4 + *': {
      'margin-top': '0',
    },
    'table': {
      'font-size': em(18, 20),
      'line-height': round(28 / 18),
    },
    'thead th': {
      'padding-inline-end': em(12, 18),
      'padding-bottom': em(16, 18),
      'padding-inline-start': em(12, 18),
    },
    'thead th:first-child': {
      'padding-inline-start': '0',
    },
    'thead th:last-child': {
      'padding-inline-end': '0',
    },
    'tbody td, tfoot td': {
      'padding-top': em(16, 18),
      'padding-inline-end': em(12, 18),
      'padding-bottom': em(16, 18),
      'padding-inline-start': em(12, 18),
    },
    'tbody td:first-child, tfoot td:first-child': {
      'padding-inline-start': '0',
    },
    'tbody td:last-child, tfoot td:last-child': {
      'padding-inline-end': '0',
    },
    'figure': {
      'margin-top': em(40, 20),
      'margin-bottom': em(40, 20),
    },
    'figure > *': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'figcaption': {
      'font-size': em(18, 20),
      'line-height': round(28 / 18),
      'margin-top': em(18, 18),
    },
    '> :first-child': {
      'margin-top': '0',
    },
    '> :last-child': {
      'margin-bottom': '0',
    },
  },
  '2xl': {
    'font-size': rem(24),
    'line-height': round(40 / 24),
    'p': {
      'margin-top': em(32, 24),
      'margin-bottom': em(32, 24),
    },
    '[class~="lead"]': {
      'font-size': em(30, 24),
      'line-height': round(44 / 30),
      'margin-top': em(32, 30),
      'margin-bottom': em(32, 30),
    },
    'blockquote': {
      'margin-top': em(64, 36),
      'margin-bottom': em(64, 36),
      'padding-inline-start': em(40, 36),
    },
    'h1': {
      'font-size': em(64, 24),
      'margin-top': '0',
      'margin-bottom': em(56, 64),
      'line-height': round(64 / 64),
    },
    'h2': {
      'font-size': em(48, 24),
      'margin-top': em(72, 48),
      'margin-bottom': em(40, 48),
      'line-height': round(52 / 48),
    },
    'h3': {
      'font-size': em(36, 24),
      'margin-top': em(56, 36),
      'margin-bottom': em(24, 36),
      'line-height': round(44 / 36),
    },
    'h4': {
      'margin-top': em(40, 24),
      'margin-bottom': em(16, 24),
      'line-height': round(36 / 24),
    },
    'img': {
      'margin-top': em(48, 24),
      'margin-bottom': em(48, 24),
    },
    'picture': {
      'margin-top': em(48, 24),
      'margin-bottom': em(48, 24),
    },
    'picture > img': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'video': {
      'margin-top': em(48, 24),
      'margin-bottom': em(48, 24),
    },
    'kbd': {
      'font-size': em(20, 24),
      'border-radius': rem(6),
      'padding-top': em(6, 24),
      'padding-inline-end': em(8, 24),
      'padding-bottom': em(6, 24),
      'padding-inline-start': em(8, 24),
    },
    'code': {
      'font-size': em(20, 24),
    },
    'h2 code': {
      'font-size': em(42, 48),
    },
    'h3 code': {
      'font-size': em(32, 36),
    },
    'pre': {
      'font-size': em(20, 24),
      'line-height': round(36 / 20),
      'margin-top': em(40, 20),
      'margin-bottom': em(40, 20),
      'border-radius': rem(8),
      'padding-top': em(24, 20),
      'padding-inline-end': em(32, 20),
      'padding-bottom': em(24, 20),
      'padding-inline-start': em(32, 20),
    },
    'ol': {
      'margin-top': em(32, 24),
      'margin-bottom': em(32, 24),
      'padding-inline-start': em(38, 24),
    },
    'ul': {
      'margin-top': em(32, 24),
      'margin-bottom': em(32, 24),
      'padding-inline-start': em(38, 24),
    },
    'li': {
      'margin-top': em(12, 24),
      'margin-bottom': em(12, 24),
    },
    'ol > li': {
      'padding-inline-start': em(10, 24),
    },
    'ul > li': {
      'padding-inline-start': em(10, 24),
    },
    '> ul > li p': {
      'margin-top': em(20, 24),
      'margin-bottom': em(20, 24),
    },
    '> ul > li > p:first-child': {
      'margin-top': em(32, 24),
    },
    '> ul > li > p:last-child': {
      'margin-bottom': em(32, 24),
    },
    '> ol > li > p:first-child': {
      'margin-top': em(32, 24),
    },
    '> ol > li > p:last-child': {
      'margin-bottom': em(32, 24),
    },
    'ul ul, ul ol, ol ul, ol ol': {
      'margin-top': em(16, 24),
      'margin-bottom': em(16, 24),
    },
    'dl': {
      'margin-top': em(32, 24),
      'margin-bottom': em(32, 24),
    },
    'dt': {
      'margin-top': em(32, 24),
    },
    'dd': {
      'margin-top': em(12, 24),
      'padding-inline-start': em(38, 24),
    },
    'hr': {
      'margin-top': em(72, 24),
      'margin-bottom': em(72, 24),
    },
    'hr + *': {
      'margin-top': '0',
    },
    'h2 + *': {
      'margin-top': '0',
    },
    'h3 + *': {
      'margin-top': '0',
    },
    'h4 + *': {
      'margin-top': '0',
    },
    'table': {
      'font-size': em(20, 24),
      'line-height': round(28 / 20),
    },
    'thead th': {
      'padding-inline-end': em(12, 20),
      'padding-bottom': em(16, 20),
      'padding-inline-start': em(12, 20),
    },
    'thead th:first-child': {
      'padding-inline-start': '0',
    },
    'thead th:last-child': {
      'padding-inline-end': '0',
    },
    'tbody td, tfoot td': {
      'padding-top': em(16, 20),
      'padding-inline-end': em(12, 20),
      'padding-bottom': em(16, 20),
      'padding-inline-start': em(12, 20),
    },
    'tbody td:first-child, tfoot td:first-child': {
      'padding-inline-start': '0',
    },
    'tbody td:last-child, tfoot td:last-child': {
      'padding-inline-end': '0',
    },
    'figure': {
      'margin-top': em(48, 24),
      'margin-bottom': em(48, 24),
    },
    'figure > *': {
      'margin-top': '0',
      'margin-bottom': '0',
    },
    'figcaption': {
      'font-size': em(20, 24),
      'line-height': round(32 / 20),
      'margin-top': em(20, 20),
    },
    '> :first-child': {
      'margin-top': '0',
    },
    '> :last-child': {
      'margin-bottom': '0',
    },
  },
}
