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

function getSizeValue(theme: Theme, hw: string, prop: string) {
  let v = theme.container?.[prop]

  switch (prop) {
    case 'fit':
    case 'max':
    case 'min':
      v = `${prop}-content`
      break
    case 'screen':
      v = hw === 'w' ? '100vw' : '100vh'
      break
  }

  if (h.number(prop) != null) {
    v = `calc(var(--spacing) * ${h.number(prop)})`
  }

  return v ?? h.bracket.cssvar.global.auto.none.fraction.rem(prop)
}

export const sizes: Rule<Theme>[] = [
  [/^size-(min-|max-)?(.+)$/, ([, m, s], { theme }) => ({
    [getPropName(m, 'w')]: getSizeValue(theme, 'w', s),
    [getPropName(m, 'h')]: getSizeValue(theme, 'h', s),
  })],
  [/^(?:size-)?(min-|max-)?([wh])-?(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(theme, w, s) })],
  [/^(?:size-)?(min-|max-)?(block|inline)-(.+)$/, ([, m, w, s], { theme }) => ({ [getPropName(m, w)]: getSizeValue(theme, w, s) }), {
    autocomplete: [
      '(w|h)-<num>',
      '(w|h)-(full|screen|fit|max|min)',
      '(max|min)-(w|h)-<num>',
      '(max|min)-(w|h)-(full|screen|fit|max|min)',
      '(block|inline)-<num>',
      '(block|inline)-(full|screen|fit|max|min)',
      '(max|min)-(w|h|block|inline)',
      '(max|min)-(w|h|block|inline)-<num>',
      '(max|min)-(w|h|block|inline)-(full|screen|fit|max|min)',
    ],
  }],
  [/^(?:size-)?(min-|max-)?(h)-screen-(.+)$/, ([, m, h, p], context) => ({ [getPropName(m, h)]: handleBreakpoint(context, p, 'verticalBreakpoint') })],
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

function handleBreakpoint(context: Readonly<RuleContext<Theme>>, point: string, key: 'breakpoint' | 'verticalBreakpoint' = 'breakpoint') {
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

export const aspectRatio: Rule<Theme>[] = [
  [/^(?:size-)?aspect-(?:ratio-)?(.+)$/, ([, d]: string[]) => ({ 'aspect-ratio': getAspectRatio(d) }), { autocomplete: ['aspect-(square|video|ratio)', 'aspect-ratio-(square|video)'] }],
]
