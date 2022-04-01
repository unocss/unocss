import type { Rule } from '@unocss/core'
import type { Theme } from '../theme'
import { handler as h, resolveBreakpoints, resolveVerticalBreakpoints } from '../utils'

const sizeMapping: Record<string, string> = {
  h: 'height',
  w: 'width',
  inline: 'inline-size',
  block: 'block-size',
}

function getPropName(minmax: string, hw: string) {
  return `${minmax || ''}${sizeMapping[hw]}`
}

type SizeProps = 'width' | 'height' | 'maxWidth' | 'maxHeight' | 'minWidth' | 'minHeight' | 'inlineSize' | 'blockSize' | 'maxInlineSize' | 'maxBlockSize' | 'minInlineSize' | 'minBlockSize'

function getSizeValue(minmax: string, hw: string, theme: Theme, prop: string) {
  const str = getPropName(minmax, hw).replace(/-(\w)/g, (_, p) => p.toUpperCase()) as SizeProps
  const v = theme[str]?.[prop]
  if (v != null)
    return v

  switch (prop) {
    case 'fit':
    case 'max':
    case 'min':
      return `${prop}-content`
  }

  return h.bracket.cssvar.auto.fraction.rem(prop)
}

export const sizes: Rule<Theme>[] = [
  [/^(min-|max-)?([wh])-?(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(m, w, theme, s) }),
    {
      autocomplete: [
        '(w|h)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
        '(max|min)-(w|h)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
      ],
    }],
  [/^(min-|max-)?(block|inline)-(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(m, w, theme, s) }),
    {
      autocomplete: [
        '(w|h)-(block|inline)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
        '(max|min)-(w|h)-(block|inline)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
      ],
    },
  ],
  [/^(min-|max-)?(h)-screen-(.+)$/, ([, m, w, s], context) => ({ [getPropName(m, w)]: resolveVerticalBreakpoints(context)?.[s] }), { autocomplete: ['h-screen-$verticalBreakpoints', '(min|max)-h-screen-$verticalBreakpoints'] }],
  [/^(min-|max-)?(w)-screen-(.+)$/, ([, m, w, s], context) => ({ [getPropName(m, w)]: resolveBreakpoints(context)?.[s] }), { autocomplete: ['w-screen-$breakpoints', '(min|max)-w-screen-$breakpoints'] }],
]

function getAspectRatio(prop: string) {
  if (/^\d+\/\d+$/.test(prop))
    return prop

  switch (prop) {
    case 'square': return '1/1'
    case 'video': return '16/9'
  }

  return h.bracket.cssvar.auto.number(prop)
}

export const aspectRatio: Rule[] = [
  [/^aspect-(?:ratio-)?(.+)$/, ([, d]: string[]) => ({ 'aspect-ratio': getAspectRatio(d) }), { autocomplete: ['aspect-(square|video)', 'aspect-ratio-(square|video)'] }],
]
