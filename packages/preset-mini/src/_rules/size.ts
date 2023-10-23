import type { Rule, RuleContext } from '@unocss/core'
import type { Theme } from '../theme'
import { h, resolveBreakpoints } from '../utils'

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

  return h.bracket.cssvar.global.auto.fraction.rem(prop)
}

export const sizes: Rule<Theme>[] = [
  [/^(?:size-)?(min-|max-)?([wh])-?(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(m, w, theme, s) })],
  [/^(?:size-)?(min-|max-)?(block|inline)-(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(m, w, theme, s) }), {
    autocomplete: [
      '(w|h)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
      '(block|inline)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
      '(max|min)-(w|h|block|inline)',
      '(max|min)-(w|h|block|inline)-$width|height|maxWidth|maxHeight|minWidth|minHeight|inlineSize|blockSize|maxInlineSize|maxBlockSize|minInlineSize|minBlockSize',
      '(w|h)-full',
      '(max|min)-(w|h)-full',
    ],
  }],
  [/^(?:size-)?(min-|max-)?(h)-screen-(.+)$/, ([, m, h, p], context) => ({ [getPropName(m, h)]: handleBreakpoint(context, p, 'verticalBreakpoints') })],
  [/^(?:size-)?(min-|max-)?(w)-screen-(.+)$/, ([, m, w, p], context) => ({ [getPropName(m, w)]: handleBreakpoint(context, p) }), {
    autocomplete: [
      '(w|h)-screen',
      '(min|max)-(w|h)-screen',
      'h-screen-$verticalBreakpoints',
      '(min|max)-h-screen-$verticalBreakpoints',
      'w-screen-$breakpoints',
      '(min|max)-w-screen-$breakpoints',
    ],
  }],
]

function handleBreakpoint(context: Readonly<RuleContext<Theme>>, point: string, key: 'breakpoints' | 'verticalBreakpoints' = 'breakpoints') {
  const bp = resolveBreakpoints(context, key)
  if (bp)
    return bp.find(i => i.point === point)?.size
}

function getAspectRatio(prop: string) {
  if (/^\d+\/\d+$/.test(prop))
    return prop

  switch (prop) {
    case 'square': return '1/1'
    case 'video': return '16/9'
  }

  return h.bracket.cssvar.global.auto.number(prop)
}

export const aspectRatio: Rule[] = [
  [/^(?:size-)?aspect-(?:ratio-)?(.+)$/, ([, d]: string[]) => ({ 'aspect-ratio': getAspectRatio(d) }), { autocomplete: ['aspect-(square|video|ratio)', 'aspect-ratio-(square|video)'] }],
]
